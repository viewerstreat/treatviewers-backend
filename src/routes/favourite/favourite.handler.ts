import {ObjectId} from '@fastify/mongodb';
import {Filter, Sort, UpdateFilter} from 'mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {FavouriteSchema, MEDIA_TYPE, MovieSchema} from '../../models/movie';
import {COLL_CLIPS, COLL_FAVOURITES, COLL_MOVIES} from '../../utils/constants';
import {GetFavouriteRequest, UpdateFavouriteRequest} from './favourite.schema';
import {ClipSchema} from '../../models/clip';

type UpdtFvFstReq = FastifyRequest<UpdateFavouriteRequest>;
export const updateFavouriteHandler = async (request: UpdtFvFstReq, reply: FastifyReply) => {
  const coll = request.mongo.db?.collection<FavouriteSchema>(COLL_FAVOURITES);
  const favFilter = {
    userId: request.user.id,
    mediaId: request.body.mediaId,
    mediaType: request.body.mediaType,
  };
  let mediaColl;
  const filter = {_id: new ObjectId(request.body.mediaId), isActive: true};
  if (request.body.mediaType === MEDIA_TYPE.MOVIE) {
    mediaColl = request.mongo.db?.collection<MovieSchema>(COLL_MOVIES);
  } else {
    mediaColl = request.mongo.db?.collection<ClipSchema>(COLL_CLIPS);
  }
  if (!mediaColl) {
    return reply.internalServerError('Unexpected error');
  }
  let [media, fav] = await Promise.all([mediaColl.findOne(filter), coll?.findOne(favFilter)]);
  if (!media) {
    return reply.notFound('media not found');
  }

  const updatedTs = request.getCurrentTimestamp();
  // add a new like and increment like count
  if (!fav) {
    await Promise.all([
      coll?.insertOne({
        userId: request.user.id,
        mediaId: request.body.mediaId,
        mediaType: request.body.mediaType,
        mediaName: request.body.mediaName,
        bannerImageUrl: request.body.bannerImageUrl,
        isRemoved: false,
        createdTs: updatedTs,
        updatedTs,
      }),
      // @ts-ignore
      mediaColl.updateOne(filter, {$inc: {likeCount: 1}, $set: {updatedTs}}, {upsert: false}),
    ]);
    return {success: true, message: 'Updated successfully'};
  }

  let update: UpdateFilter<MovieSchema | ClipSchema> = {};
  if (!fav.isRemoved) {
    update = {$inc: {likeCount: -1}, $set: {updatedTs}};
  } else {
    update = {$inc: {likeCount: 1}, $set: {updatedTs}};
  }
  const updateFav: UpdateFilter<FavouriteSchema> = {
    $set: {
      mediaName: request.body.mediaName,
      bannerImageUrl: request.body.bannerImageUrl,
      isRemoved: !fav.isRemoved,
      updatedTs,
    },
  };

  await Promise.all([
    coll?.updateOne(favFilter, updateFav, {upsert: false}),
    // @ts-ignore
    mediaColl.updateOne(filter, update, {upsert: false}),
  ]);

  return {success: true, message: 'Updated successfully'};
};

type GetFavFst = FastifyRequest<GetFavouriteRequest>;
export const getFavouriteHandler = async (request: GetFavFst, reply: FastifyReply) => {
  const coll = request.mongo.db?.collection<FavouriteSchema>(COLL_FAVOURITES);
  const findBy: Filter<FavouriteSchema> = {mediaType: request.query.mediaType, isRemoved: false};
  const sortBy: Sort = {updatedTs: -1};
  const pageNo = request.query.pageIndex || 0;
  const pageSize = request.query.pageSize || request.getDefaultPageSize();
  const data = await coll
    ?.find(findBy)
    .sort(sortBy)
    .skip(pageNo * pageSize)
    .limit(pageSize)
    .toArray();
  return {success: true, data};
};
