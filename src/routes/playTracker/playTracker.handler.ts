import {ObjectId} from '@fastify/mongodb';
import {Filter, UpdateFilter, Sort} from 'mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {ContestSchema, CONTEST_STATUS} from '../../models/contest';
import {Answer, PlayTrackerSchema, PLAY_STATUS} from '../../models/playTracker';
import {COLL_CONTESTS, COLL_PLAY_TRACKERS, COLL_QUESTIONS} from '../../utils/constants';
import {AnswerRequest, FinishRequest, PlayStartReq, PlayTrackerGetReq} from './playTracker.schema';
import {QuestionSchema} from '../../models/question';

// get playTracker
// if contestId is not valid then return 404
// if the playTracker does not exist then insert with status INIT.
type InitReq = FastifyRequest<PlayTrackerGetReq>;
export const playTrackerHandler = async (request: InitReq, reply: FastifyReply) => {
  const collContest = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const collPlayTracker = request.mongo.db?.collection<PlayTrackerSchema>(COLL_PLAY_TRACKERS);
  const userId = request.user.id;
  const {contestId} = request.query;
  const currTs = request.getCurrentTimestamp();
  // check if the contestId is valid
  const contest = await collContest?.findOne({_id: new ObjectId(contestId)});
  if (!contest) {
    return reply.notFound('contest not found');
  }
  // check if the contestId already exists in playTracker
  const playTrackerResult = await collPlayTracker?.findOne({userId, contestId});
  // if the status is finished then return success response
  if (playTrackerResult) {
    return {success: true, data: playTrackerResult};
  }
  // check if contest is active
  if (contest.status !== CONTEST_STATUS.ACTIVE) {
    return reply.badRequest('contest status is not active');
  }
  // check if startTime is greater than current timestamp then return error
  if (contest.startTime > currTs) {
    return reply.badRequest('contest has not started yet');
  }
  // check if endTime is not expired
  if (contest.endTime < currTs) {
    return reply.badRequest('contest endTime is over already');
  }

  // insert into playTracker if not exists already
  const data: PlayTrackerSchema = {
    userId,
    contestId,
    initTs: currTs,
    status: PLAY_STATUS.INIT,
    currQuestionNo: 0,
    totalQuestions: contest.questionCount || 0,
    answers: [],
    createdTs: currTs,
  };
  await collPlayTracker?.insertOne(data);
  return {success: true, data};
};

// handler function for start play
// playTracker must exists at this point
// playTracker should be paid already or entryFee is zero
// contest startTs endTs should be valid
// update the playTracker and return
type StrPlFstReq = FastifyRequest<PlayStartReq>;
export const startPlayHandler = async (request: StrPlFstReq, reply: FastifyReply) => {
  const collContest = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const collPlayTracker = request.mongo.db?.collection<PlayTrackerSchema>(COLL_PLAY_TRACKERS);
  const collQues = request.mongo.db?.collection<QuestionSchema>(COLL_QUESTIONS);
  const userId = request.user.id;
  const {contestId} = request.body;
  const currTs = request.getCurrentTimestamp();
  const [contest, playTracker] = await Promise.all([
    collContest?.findOne({_id: new ObjectId(contestId)}),
    collPlayTracker?.findOne({userId, contestId}),
  ]);

  // check if the contestId is valid
  if (!contest) {
    return reply.notFound('contest not found');
  }
  // check if the contestId already exists in playTracker
  if (!playTracker) {
    return reply.badRequest('playTracker not found');
  }
  // check if contest is active
  if (contest.status !== CONTEST_STATUS.ACTIVE) {
    return reply.badRequest('contest status is not active');
  }
  // check if startTime is greater than current timestamp then return error
  if (contest.startTime > currTs) {
    return reply.badRequest('contest has not started yet');
  }
  // check if endTime is not expired
  if (contest.endTime < currTs) {
    return reply.badRequest('contest endTime is over already');
  }
  // if play status is finished then return error
  if (playTracker.status === PLAY_STATUS.FINISHED) {
    return reply.badRequest('play is already finished');
  }
  // contest must be free or already paid or in started status
  if (playTracker.status === PLAY_STATUS.INIT && contest.entryFee && contest.entryFee > 0) {
    return reply.badRequest('contest is not paid yet');
  }

  // update the playtracker object with resumeTs or startTs according to status
  const update: UpdateFilter<PlayTrackerSchema> = {};
  if (playTracker.status === PLAY_STATUS.STARTED) {
    update.$push = {resumeTs: currTs};
  }
  if (playTracker.status === PLAY_STATUS.INIT || playTracker.status === PLAY_STATUS.PAID) {
    update.$set = {startTs: currTs, status: PLAY_STATUS.STARTED, currQuestionNo: 0};
  }
  update.$set = {...update.$set, updatedTs: currTs};
  const result = await collPlayTracker?.findOneAndUpdate({contestId, userId}, update, {
    returnDocument: 'after',
    upsert: false,
  });
  // if unable to update play tracker then return error
  const data = result?.value;
  if (!data) {
    return reply.internalServerError('invalid play tracker');
  }
  // query to find the question for the play tracker
  const findBy: Filter<QuestionSchema> = {
    contestId,
    questionNo: {$gt: data.currQuestionNo},
    isActive: true,
  };
  const sortBy: Sort = {questionNo: 1};
  const qRes = await collQues?.find(findBy).sort(sortBy).limit(1).toArray();
  // if question is not found then return error
  if (!qRes || qRes.length < 1) {
    return reply.internalServerError('Question not found');
  }
  // question object to return in the response
  const question = qRes[0];
  // return successful response
  return {success: true, data, question};
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
    return reply.badRequest('contest not found');
  }
  // check if the contestId already exists in playTracker
  if (!playTracker) {
    return reply.badRequest('playTracker not found');
  }
  // check if the question is valid
  if (!question) {
    return reply.badRequest('question not found');
  }
  // playTracker status must be STARTED
  if (playTracker.status !== PLAY_STATUS.STARTED) {
    return reply.badRequest('playTracker status must be STARTED');
  }
  // check if endTime is not expired
  if (contest.endTime < currTs) {
    return reply.badRequest('contest endTime is over already');
  }
  // questionNo and currQuestionNo from playTracker should match
  const currQuestionNo = playTracker.currQuestionNo || 0;
  if (request.body.questionNo !== currQuestionNo + 1) {
    return reply.badRequest(`currQuestionNo is ${currQuestionNo}`);
  }
  // get the correct option for the question
  const correctOption = question.options?.filter((e) => e.isCorrect) || [];
  // match the correct option and get score, if correct then 1 otherwise 0
  const score =
    correctOption?.length > 0 && correctOption[0].optionId === request.body.selectedOptionId
      ? 1
      : 0;
  const totalAnswered = (playTracker.totalAnswered || 0) + 1;
  const isFinished = (playTracker.totalQuestions || 0) === totalAnswered;
  // create the answer schema
  const ans: Answer = {
    questionNo: request.body.questionNo,
    questionText: question.questionText || '',
    options: question.options || [],
    selectedOptionId: request.body.selectedOptionId,
  };
  const update: UpdateFilter<PlayTrackerSchema> = {
    $addToSet: {answers: ans},
    $inc: {currQuestionNo: 1, totalAnswered: 1, score},
    $set: {updatedTs: currTs},
  };
  if (isFinished) {
    update.$set = {...update.$set, finishTs: currTs, status: PLAY_STATUS.FINISHED};
  }
  // update the playTracker document
  const result = await collPlayTracker?.findOneAndUpdate(filterPlayTrk, update, {
    returnDocument: 'after',
    upsert: false,
  });
  // if unable to update play tracker then return error
  const data = result?.value;
  if (!data || !data.currQuestionNo) {
    return reply.internalServerError('invalid play tracker');
  }
  // if finished already then return response
  if (isFinished) {
    return {success: true, data};
  }

  // query to find the question for the play tracker
  const findBy: Filter<QuestionSchema> = {
    contestId,
    questionNo: {$gt: data.currQuestionNo},
    isActive: true,
  };
  const sortBy: Sort = {questionNo: 1};
  const qRes = await collQues?.find(findBy).sort(sortBy).limit(1).toArray();
  // if question is not found then return error
  if (!qRes || qRes.length < 1) {
    return reply.internalServerError('Question not found');
  }

  // return successful response
  return {success: true, data, question: qRes[0]};
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
    return reply.badRequest('contest not found');
  }
  // check if the contestId already exists in playTracker
  if (!playTracker) {
    return reply.badRequest('playTracker not found');
  }
  // playTracker status must be STARTED
  if (playTracker.status !== PLAY_STATUS.STARTED) {
    return reply.badRequest('playTracker status must be STARTED');
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
