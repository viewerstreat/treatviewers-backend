import {ObjectId} from '@fastify/mongodb';
import {Filter, Sort} from 'mongodb';
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {FavouriteSchema, MEDIA_TYPE, MovieSchema} from '../../models/movie';
import {COLL_CLIPS, COLL_FAVOURITES, COLL_MOVIES} from '../../utils/constants';
import {GetFavouriteRequest, UpdateFavouriteRequest} from './favourite.schema';
import {ClipSchema} from '../../models/clip';

export const updateFavouriteHandler = async (
  request: FastifyRequest<UpdateFavouriteRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  let mediaColl;
  const filter = {_id: new ObjectId(request.body.mediaId)};
  if (request.body.mediaType === MEDIA_TYPE.MOVIE) {
    mediaColl = fastify.mongo.db?.collection<MovieSchema>(COLL_MOVIES);
  } else {
    mediaColl = fastify.mongo.db?.collection<ClipSchema>(COLL_CLIPS);
  }
  if (mediaColl) {
    const res = await mediaColl.findOne(filter);
    if (!res) {
      reply.status(404).send({success: false, message: 'media not found'});
      return;
    }
  }

  const coll = fastify.mongo.db?.collection<FavouriteSchema>(COLL_FAVOURITES);
  const findBy = {
    userId: request.user.id,
    mediaId: request.body.mediaId,
    mediaType: request.body.mediaType,
  };
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
