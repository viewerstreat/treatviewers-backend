import {ObjectId} from '@fastify/mongodb';
import {Filter} from 'mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {ContestSchema} from '../../models/contest';
import {Answer, PlayTrackerSchema, PLAY_STATUS} from '../../models/playTracker';
import {COLL_CONTESTS, COLL_PLAY_TRACKERS, COLL_QUESTIONS} from '../../utils/constants';
import {AnswerRequest, FinishRequest, PlayTrackerInitReq} from './playTracker.schema';
import {QuestionSchema} from '../../models/question';

// get playTracker
// if contestId is not valid then return 404
// if the playTracker is in PAID status then update the status to STARTED
// if the playTracker is in INIT status or does not exist then
// check if the entryFee is zero. Otherwise return 409 error.
// Because if the entryFee is non zero then it has to be PAID first.
// if the playTracker does not exist then insert with status STARTED.
type InitReq = FastifyRequest<PlayTrackerInitReq>;
export const playTrackerHandler = async (request: InitReq, reply: FastifyReply) => {
  const collContest = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const collPlayTracker = request.mongo.db?.collection<PlayTrackerSchema>(COLL_PLAY_TRACKERS);
  const userId = request.user.id;
  const {contestId} = request.query;
  const currTs = request.getCurrentTimestamp();
  // check if the contestId is valid
  const contest = await collContest?.findOne({_id: new ObjectId(contestId)});
  if (!contest) {
    reply.status(404).send({success: false, message: 'contest not found'});
    return;
  }
  // check if the contestId already exists in playTracker
  const playTrackerResult = await collPlayTracker?.findOne({userId, contestId});
  // if the status is finished then return success response
  if (playTrackerResult && playTrackerResult.status === PLAY_STATUS.FINISHED) {
    return {success: true, data: playTrackerResult};
  }
  // check if startTime is greater than current timestamp then return error
  if (contest.startTime > currTs) {
    reply.status(409).send({success: false, message: 'contest endTime is over already'});
    return;
  }
  // check if endTime is not expired
  if (contest.endTime < currTs) {
    reply.status(409).send({success: false, message: 'contest endTime is over already'});
    return;
  }
  // if the status is started then update resumeTs and return success response
  if (playTrackerResult && playTrackerResult.status === PLAY_STATUS.STARTED) {
    await collPlayTracker?.updateOne({userId, contestId}, {$push: {resumeTs: currTs}});
    return {success: true, data: playTrackerResult};
  }
  // if entryFee is non zero and status is not PAID
  if (contest.entryFee && contest.entryFee > 0 && PLAY_STATUS.PAID !== playTrackerResult?.status) {
    reply.status(409).send({success: false, message: 'contest is not paid yet'});
    return;
  }

  // if the playTracker exists at this point then it must be INIT or PAID status
  // update the status to STARTED and return the updated document
  if (playTrackerResult) {
    // if the status is paid
    const result = await collPlayTracker?.findOneAndUpdate(
      {contestId, userId},
      {
        $set: {
          status: PLAY_STATUS.STARTED,
          startTs: currTs,
          currQuestionNo: 0,
          totalQuestions: contest.questionCount || 0,
          answers: [],
          totalAnswered: 0,
          updatedTs: currTs,
        },
      },
      {upsert: false, returnDocument: 'after'},
    );
    const data = result?.value;
    return {success: true, data};
  }

  // insert into playTracker if not exists already
  const data: PlayTrackerSchema = {
    userId,
    contestId,
    initTs: currTs,
    status: PLAY_STATUS.STARTED,
    startTs: currTs,
    currQuestionNo: 0,
    totalQuestions: contest.questionCount || 0,
    answers: [],
    createdTs: currTs,
  };
  await collPlayTracker?.insertOne(data);
  return {success: true, data};
};

// handler function for saving answer given by the user
// the PlayTracker status must be STARTED to provide answer
// endTime for contest must be greater than current timestamp
// save values in the answer array also increse the
// score and currQuestionNo accordingly
type AnsFstReq = FastifyRequest<AnswerRequest>;
export const answerHandler = async (request: AnsFstReq, reply: FastifyReply) => {
  const collContest = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const collPlayTracker = request.mongo.db?.collection<PlayTrackerSchema>(COLL_PLAY_TRACKERS);
  const collQues = request.mongo.db?.collection<QuestionSchema>(COLL_QUESTIONS);
  const userId = request.user.id;
  const {contestId} = request.body;
  const currTs = request.getCurrentTimestamp();
  const filterContest: Filter<ContestSchema> = {_id: new ObjectId(contestId)};
  const filterPlayTrk: Filter<PlayTrackerSchema> = {contestId, userId};
  const filterQs: Filter<QuestionSchema> = {
    contestId,
    questionNo: request.body.questionNo,
    isActive: true,
  };
  const [contest, playTracker, question] = await Promise.all([
    collContest?.findOne(filterContest),
    collPlayTracker?.findOne(filterPlayTrk),
    collQues?.findOne(filterQs),
  ]);
  // check if the contestId is valid
  if (!contest) {
    reply.status(404).send({success: false, message: 'contest not found'});
    return;
  }
  // check if the contestId already exists in playTracker
  if (!playTracker) {
    reply.status(404).send({success: false, message: 'playTracker not found'});
    return;
  }
  // check if the question is valid
  if (!question) {
    reply.status(404).send({success: false, message: 'question not found'});
    return;
  }
  // playTracker status must be STARTED
  if (playTracker.status !== PLAY_STATUS.STARTED) {
    reply.status(409).send({success: false, message: 'playTracker status must be STARTED'});
    return;
  }
  // check if endTime is not expired
  if (contest.endTime < currTs) {
    reply.status(409).send({success: false, message: 'contest endTime is over already'});
    return;
  }
  // get the correct option for the question
  const correctOption = question.options?.filter((e) => e.isCorrect) || [];
  // match the correct option and get score, if correct then 1 otherwise 0
  const score =
    correctOption?.length > 0 && correctOption[0].optionId === request.body.selectedOptionId
      ? 1
      : 0;
  // create the answer schema
  const ans: Answer = {
    questionNo: request.body.questionNo,
    questionText: question.questionText || '',
    options: question.options || [],
    selectedOptionId: request.body.selectedOptionId,
  };
  // update the playTracker document
  const result = await collPlayTracker?.findOneAndUpdate(
    filterPlayTrk,
    {
      $addToSet: {answers: ans},
      $inc: {currQuestionNo: 1, totalAnswered: 1, score},
      $set: {updatedTs: currTs},
    },
    {returnDocument: 'after', upsert: false},
  );

  return {success: true, data: result?.value};
};

// handler function for finish quiz
// must be valid contest
// playTracker must be in Started status
type FnshFastReq = FastifyRequest<FinishRequest>;
export const finishHandler = async (request: FnshFastReq, reply: FastifyReply) => {
  const collContest = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const collPlayTracker = request.mongo.db?.collection<PlayTrackerSchema>(COLL_PLAY_TRACKERS);
  const userId = request.user.id;
  const {contestId} = request.body;
  const currTs = request.getCurrentTimestamp();
  const filterContest: Filter<ContestSchema> = {_id: new ObjectId(contestId)};
  const filterPlayTrk: Filter<PlayTrackerSchema> = {contestId, userId};

  const [contest, playTracker] = await Promise.all([
    collContest?.findOne(filterContest),
    collPlayTracker?.findOne(filterPlayTrk),
  ]);
  // check if the contestId is valid
  if (!contest) {
    reply.status(404).send({success: false, message: 'contest not found'});
    return;
  }
  // check if the contestId already exists in playTracker
  if (!playTracker) {
    reply.status(404).send({success: false, message: 'playTracker not found'});
    return;
  }
  // playTracker status must be STARTED
  if (playTracker.status !== PLAY_STATUS.STARTED) {
    reply.status(409).send({success: false, message: 'playTracker status must be STARTED'});
    return;
  }
  const result = await collPlayTracker?.findOneAndUpdate(
    filterPlayTrk,
    {
      $set: {
        status: PLAY_STATUS.FINISHED,
        finishTs: currTs,
        updatedTs: currTs,
      },
    },
    {returnDocument: 'after', upsert: false},
  );

  return {success: true, data: result?.value};
};
