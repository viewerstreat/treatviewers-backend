import {FastifyPluginAsync} from 'fastify';
import {createClipHandler} from './clip.handler';
import {CreateClipRequest, CreateClipRequestOpts} from './clip.schema';

const clipRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // create clip
  fastify.post<CreateClipRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...CreateClipRequestOpts},
    (request, reply) => createClipHandler(request, reply, fastify),
  );
};

export default clipRoute;
