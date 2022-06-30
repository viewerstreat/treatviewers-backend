import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {ClipSchema} from '../../models/clip';
import {COLL_CLIPS} from '../../utils/constants';
import {CreateClipRequest} from './clip.schema';

export const createClipHandler = async (
  request: FastifyRequest<CreateClipRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const collection = fastify.mongo.db?.collection<ClipSchema>(COLL_CLIPS);
  const doc: ClipSchema = {
    name: request.body.name,
    description: request.body.description,
    bannerImageUrl: request.body.bannerImageUrl,
    videoUrl: request.body.videoUrl,
    viewCount: 0,
    likeCount: 0,
    isActive: true,
    createdBy: request.user.id,
    createdTs: fastify.getCurrentTimestamp(),
  };
  const result = await collection?.insertOne(doc);
  const data: ClipSchema = {
    _id: result?.insertedId,
    ...doc,
  };
  return {success: true, data};
};
