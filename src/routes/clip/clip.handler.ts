import {ObjectId} from '@fastify/mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {Filter, Sort} from 'mongodb';
import {ClipSchema} from '../../models/clip';
import {COLL_CLIPS} from '../../utils/constants';
import {CreateClipRequest, GetClipRequest} from './clip.schema';

export const createClipHandler = async (
  request: FastifyRequest<CreateClipRequest>,
  reply: FastifyReply,
) => {
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

export const getClipHandler = async (
  request: FastifyRequest<GetClipRequest>,
  reply: FastifyReply,
) => {
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
  return {success: true, data: result};
};
