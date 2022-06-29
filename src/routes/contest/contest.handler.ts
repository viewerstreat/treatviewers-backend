import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {ContestSchema} from '../../models/contest';
import {COLL_CONTESTS} from '../../utils/constants';
import {CreateContestRequest} from './contest.schema';

export const createContestHandler = async (
  request: FastifyRequest<CreateContestRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const collection = fastify.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const doc: ContestSchema = {
    title: request.body.title,
    category: request.body.category,
    movieId: request.body.movieId,
    sponsoredBy: request.body.sponsoredBy,
    sponsoredByLogo: request.body.sponsoredByLogo,
    bannerImageUrl: request.body.bannerImageUrl,
    videoUrl: request.body.videoUrl,
    entryFee: request.body.entryFee,
    topPrize: request.body.topPrize,
    prizeRatio: request.body.prizeRatio,
    topWinners: request.body.topWinners,
    startTime: request.body.startTime,
    endTime: request.body.endTime,
    questionCount: 0,
    viewCount: 0,
    likeCount: 0,
    isActive: true,
    createdBy: request.user.id,
    createdTs: fastify.getCurrentTimestamp(),
  };
  const result = await collection?.insertOne(doc);
  const data: ContestSchema = {
    _id: result?.insertedId,
    ...doc,
  };
  return {success: true, data};
};
