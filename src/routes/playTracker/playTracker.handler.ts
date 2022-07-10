import {ObjectId} from '@fastify/mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {ContestSchema} from '../../models/contest';
import {PlayTrackerSchema, PLAY_STATUS} from '../../models/playTracker';
import {COLL_CONTESTS, COLL_PLAY_TRACKERS} from '../../utils/constants';
import {PlayTrackerInitReq} from './playTracker.schema';

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
  // check if the contestId is valid
  const contest = await collContest?.findOne({_id: new ObjectId(contestId)});
  if (!contest) {
    reply.status(404).send({success: false, message: 'contest not found'});
    return;
  }
  // check if the contestId already exists in playTracker
  const playTrackerResult = await collPlayTracker?.findOne({userId, contestId});
  // if the status is finished or started then return success response
  if (
    playTrackerResult &&
    (playTrackerResult.status === PLAY_STATUS.FINISHED ||
      playTrackerResult.status === PLAY_STATUS.STARTED)
  ) {
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
    const currTs = request.getCurrentTimestamp();
    const result = await collPlayTracker?.findOneAndUpdate(
      {contestId, userId},
      {
        $set: {
          status: PLAY_STATUS.STARTED,
          startTs: currTs,
          currQuestionNo: 0,
          totalQuestions: contest.questionCount || 0,
          answers: [],
          updatedTs: currTs,
        },
      },
      {upsert: false, returnDocument: 'after'},
    );
    const data = result?.value;
    return {success: true, data};
  }

  // insert into playTracker if not exists already
  const currTs = request.getCurrentTimestamp();
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
