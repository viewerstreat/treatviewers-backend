import {ObjectId} from '@fastify/mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {Filter, Sort} from 'mongodb';
import {ContestSchema} from '../../models/contest';
import {COLL_CONTESTS} from '../../utils/constants';
import {CreateContestRequest, GetContestRequest} from './contest.schema';

export const createContestHandler = async (
  request: FastifyRequest<CreateContestRequest>,
  reply: FastifyReply,
) => {
  const collection = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
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
    createdTs: request.getCurrentTimestamp(),
  };
  const result = await collection?.insertOne(doc);
  const data: ContestSchema = {
    _id: result?.insertedId,
    ...doc,
  };
  return {success: true, data};
};

export const getContestHandler = async (
  request: FastifyRequest<GetContestRequest>,
  reply: FastifyReply,
) => {
  // generate the findBy query
  const findBy: Filter<ContestSchema> = {isActive: true};
  // filter by _id if it is passed in the query parameters
  if (request.query._id) {
    findBy._id = new ObjectId(request.query._id);
  }
  // filter by movieId is it is passed in the query parameters
  if (request.query.movieId) {
    findBy.movieId = request.query.movieId;
  }
  const sortBy: Sort = {_id: -1};
  const pageNo = request.query.pageIndex || 0;
  const pageSize = request.query.pageSize || request.getDefaultPageSize();
  const result = await request.mongo.db
    ?.collection<ContestSchema>(COLL_CONTESTS)
    .find(findBy)
    .skip(pageNo * pageSize)
    .limit(pageSize)
    .sort(sortBy)
    .toArray();
  return {success: true, data: result};
};
