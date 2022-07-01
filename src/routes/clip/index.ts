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
  fastify.post<CreateClipRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...CreateClipRequestOpts},
    (request, reply) => createClipHandler(request, reply, fastify),
  );

  // get clip
  fastify.get<GetClipRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...GetClipRequestOpts},
    (request, reply) => getClipHandler(request, reply, fastify),
  );
};

export default clipRoute;
