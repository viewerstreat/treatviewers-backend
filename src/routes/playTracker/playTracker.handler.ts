import {ObjectId} from '@fastify/mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {ContestSchema} from '../../models/contest';
import {PlayTrackerSchema, PLAY_STATUS} from '../../models/playTracker';
import {COLL_CONTESTS, COLL_PLAY_TRACKERS} from '../../utils/constants';
import {PlayTrackerInitReq} from './playTracker.schema';

type InitReq = FastifyRequest<PlayTrackerInitReq>;
export const initHandler = async (request: InitReq, reply: FastifyReply) => {
  const collContest = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const collPlayTracker = request.mongo.db?.collection<PlayTrackerSchema>(COLL_PLAY_TRACKERS);
  // check if the contestId is valid
  const result = await collContest?.findOne({_id: new ObjectId(request.body.contestId)});
  if (!result) {
    reply.status(404).send({success: false, message: 'contest not found'});
    return;
  }
  // check if the contestId already exists in playTracker
  const playTrackerResult = await collPlayTracker?.findOne({
    userId: request.user.id,
    contestId: request.body.contestId,
  });
  // if the status is finished
  if (playTrackerResult?.status === PLAY_STATUS.FINISHED) {
    reply.status(409).send({success: false, message: 'Quiz has finished already'});
    return;
  }
  // if the status is started
  if (playTrackerResult?.status === PLAY_STATUS.STARTED) {
    return {success: true, data: playTrackerResult};
  }
  // if the status is paid
  if (playTrackerResult?.status === PLAY_STATUS.PAID) {
    return {success: true, data: playTrackerResult};
  }
  // insert into playTracker if not exists already
  if (!playTrackerResult) {
    collPlayTracker?.insertOne({
      userId: request.user.id,
      contestId: request.body.contestId,
      status: PLAY_STATUS.INIT,
      initTs: request.getCurrentTimestamp(),
      createdTs: request.getCurrentTimestamp(),
    });
  }
};
