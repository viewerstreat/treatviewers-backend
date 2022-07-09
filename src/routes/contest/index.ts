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
  fastify.post<CreateContestRequest>('/', CreateContestRequestOpts, createContestHandler);

  // get contest
  fastify.get<GetContestRequest>('/', GetContestRequestOpts, getContestHandler);
};

export default contestRoute;
