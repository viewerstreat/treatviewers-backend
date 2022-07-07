import {ObjectId} from '@fastify/mongodb';
import {Filter, Sort} from 'mongodb';
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {FavouriteSchema} from '../../models/movie';
import {COLL_FAVOURITES} from '../../utils/constants';
import {GetFavouriteRequest, UpdateFavouriteRequest} from './favourite.schema';

export const updateFavouriteHandler = async (
  request: FastifyRequest<UpdateFavouriteRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const coll = fastify.mongo.db?.collection<FavouriteSchema>(COLL_FAVOURITES);
  const findBy = {userId: request.user.id, mediaId: request.body.mediaId};
  let result = await coll?.findOne(findBy);
  if (!result) {
    result = {
      _id: new ObjectId(),
      userId: request.user.id,
      mediaId: request.body.mediaId,
      mediaName: request.body.mediaName,
      mediaType: request.body.mediaType,
      bannerImageUrl: request.body.bannerImageUrl,
      isRemoved: false,
      createdTs: fastify.getCurrentTimestamp(),
      updatedTs: fastify.getCurrentTimestamp(),
    };
  } else {
    result.mediaName = request.body.mediaName;
    result.bannerImageUrl = request.body.bannerImageUrl;
    result.isRemoved = !result.isRemoved;
    result.updatedTs = fastify.getCurrentTimestamp();
  }

  await coll?.findOneAndUpdate(findBy, {$set: result}, {upsert: true});
  return {success: true, message: 'Updated successfully'};
};

export const getFavouriteHandler = async (
  request: FastifyRequest<GetFavouriteRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const coll = fastify.mongo.db?.collection<FavouriteSchema>(COLL_FAVOURITES);
  const findBy: Filter<FavouriteSchema> = {mediaType: request.query.mediaType, isRemoved: false};
  const sortBy: Sort = {updatedTs: -1};
  const pageNo = request.query.pageIndex || 0;
  const pageSize = request.query.pageSize || fastify.getDefaultPageSize();
  const data = await coll
    ?.find(findBy)
    .sort(sortBy)
    .skip(pageNo * pageSize)
    .limit(pageSize)
    .toArray();
  return {success: true, data};
};
