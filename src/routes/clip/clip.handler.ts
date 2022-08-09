import {ObjectId} from '@fastify/mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {Filter, Sort} from 'mongodb';
import {ClipSchema, ClipViewSchema} from '../../models/clip';
import {FavouriteSchema, MEDIA_TYPE} from '../../models/movie';
import {COLL_CLIPS, COLL_CLIP_VIEWS, COLL_FAVOURITES} from '../../utils/constants';
import {AddViewRequest, CreateClipRequest, GetClipRequest} from './clip.schema';

type CrtClpFst = FastifyRequest<CreateClipRequest>;
export const createClipHandler = async (request: CrtClpFst, reply: FastifyReply) => {
  const collection = request.mongo.db?.collection<ClipSchema>(COLL_CLIPS);
  const doc: ClipSchema = {
    name: request.body.name,
    description: request.body.description,
    bannerImageUrl: request.body.bannerImageUrl,
    videoUrl: request.body.videoUrl,
    viewCount: 0,
    likeCount: 0,
    isActive: true,
    createdBy: request.user.id,
    createdTs: request.getCurrentTimestamp(),
  };
  const result = await collection?.insertOne(doc);
  const data: ClipSchema = {
    _id: result?.insertedId,
    ...doc,
  };
  return {success: true, data};
};

type GetClipFst = FastifyRequest<GetClipRequest>;
export const getClipHandler = async (request: GetClipFst, reply: FastifyReply) => {
  // generate the findBy query
  const findBy: Filter<ClipSchema> = {isActive: true};
  // filter by _id if it is passed in the query parameters
  if (request.query._id) {
    let oid = new ObjectId(request.query._id);
    findBy._id = oid;
  }
  const sortBy: Sort = {_id: -1};
  const pageNo = request.query.pageIndex || 0;
  const pageSize = request.query.pageSize || request.getDefaultPageSize();
  const result = await request.mongo.db
    ?.collection<ClipSchema>(COLL_CLIPS)
    .find(findBy)
    .skip(pageNo * pageSize)
    .limit(pageSize)
    .sort(sortBy)
    .toArray();

  const {authorization} = request.headers;
  if (authorization) {
    const splitted = authorization.split(' ');
    if (splitted.length === 2) {
      const userId = request.getUserIdFromToken(splitted[1]);
      if (userId && result) {
        const clipIds = result.map((e) => e._id.toString());
        const collFav = request.mongo.db?.collection<FavouriteSchema>(COLL_FAVOURITES);
        const filter: Filter<FavouriteSchema> = {
          mediaType: MEDIA_TYPE.CLIP,
          mediaId: {$in: clipIds},
          userId,
          isRemoved: false,
        };
        const favResult = await collFav?.find(filter).toArray();
        result.forEach((el) => {
          const clipId = el._id.toString();
          const v = favResult?.find((elem) => elem.mediaId === clipId);
          el.isLikedByMe = !!v;
        });
      }
    }
  }

  return {success: true, data: result};
};

type AdVwFstReq = FastifyRequest<AddViewRequest>;
export const addClipViewHandler = async (request: AdVwFstReq, reply: FastifyReply) => {
  const collClip = request.mongo.db?.collection<ClipSchema>(COLL_CLIPS);
  const coll = request.mongo.db?.collection<ClipViewSchema>(COLL_CLIP_VIEWS);
  const {clipId} = request.body;
  const userId = request.user.id;
  const clipFilter: Filter<ClipSchema> = {_id: new ObjectId(clipId)};
  const viewFilter: Filter<ClipViewSchema> = {clipId, userId};
  const [clip, clipView] = await Promise.all([
    collClip?.findOne(clipFilter),
    coll?.findOne(viewFilter),
  ]);
  if (!clip) {
    return reply.notFound('Clip not found');
  }
  const updatedTs = request.getCurrentTimestamp();
  let viewCount = clip.viewCount || 0;
  if (!clipView) {
    await collClip?.updateOne(clipFilter, {$inc: {viewCount: 1}, $set: {updatedTs}});
    viewCount += 1;
  }
  await coll?.findOneAndUpdate(viewFilter, {$set: {clipId, userId, updatedTs}}, {upsert: true});
  return {success: true, message: 'Updated successfully', viewCount};
};
