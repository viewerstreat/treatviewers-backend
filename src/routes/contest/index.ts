import {FastifyPluginAsync} from 'fastify';
import {
  activateHandler,
  contestWiseResultHandler,
  createContestHandler,
  getContestHandler,
  inActivateHandler,
} from './contest.handler';
import {
  ActivateReqOpts,
  ActivateRequest,
  ContestWiseResultOpts,
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

  // get contestwise result for an user
  fastify.get('/contestWiseResult', ContestWiseResultOpts, contestWiseResultHandler);
};

export default contestRoute;
