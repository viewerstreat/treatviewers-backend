import {FastifyPluginAsync} from 'fastify';
import {createContestHandler, getContestHandler} from './contest.handler';
import {
  CreateContestRequest,
  CreateContestRequestOpts,
  GetContestRequest,
  GetContestRequestOpts,
} from './contest.schema';

const contestRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // create contest
  fastify.post<CreateContestRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...CreateContestRequestOpts},
    (request, reply) => createContestHandler(request, reply, fastify),
  );

  // get contest
  fastify.get<GetContestRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...GetContestRequestOpts},
    (request, reply) => getContestHandler(request, reply, fastify),
  );
};

export default contestRoute;
