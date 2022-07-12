import {FastifyPluginAsync} from 'fastify';
import {
  activateHandler,
  createContestHandler,
  getContestHandler,
  inActivateHandler,
} from './contest.handler';
import {
  ActivateReqOpts,
  ActivateRequest,
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

  // make contest active
  fastify.post<ActivateRequest>('/activate', ActivateReqOpts, activateHandler);

  // make contest inactive
  fastify.post<ActivateRequest>('/inActivate', ActivateReqOpts, inActivateHandler);
};

export default contestRoute;
