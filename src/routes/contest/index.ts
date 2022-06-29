import {FastifyPluginAsync} from 'fastify';
import {createContestHandler} from './contest.handler';
import {CreateContestRequest, CreateContestRequestOpts} from './contest.schema';

const contestRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // create contest
  fastify.post<CreateContestRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...CreateContestRequestOpts},
    (request, reply) => createContestHandler(request, reply, fastify),
  );
};

export default contestRoute;
