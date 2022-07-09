import {FastifyPluginAsync} from 'fastify';
import {createClipHandler, getClipHandler} from './clip.handler';
import {
  CreateClipRequest,
  CreateClipRequestOpts,
  GetClipRequest,
  GetClipRequestOpts,
} from './clip.schema';

const clipRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // create clip
  fastify.post<CreateClipRequest>('/', CreateClipRequestOpts, createClipHandler);

  // get clip
  fastify.get<GetClipRequest>('/', GetClipRequestOpts, getClipHandler);
};

export default clipRoute;
