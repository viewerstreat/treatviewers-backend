import {FastifyPluginAsync} from 'fastify';
import {
  addBalEndHandler,
  addBalInitHandler,
  getWalletBalHandler,
  payContestHandler,
} from './wallet.handler';
import {
  AddBalEndOpts,
  AddBalEndRequest,
  AddBalInitOpts,
  AddBalInitRequest,
  GetWalletBalOpts,
  PayContestOpts,
  PayContestRequest,
} from './wallet.schema';

const walletRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // get wallet balnce for an user
  fastify.get('/getBalance', GetWalletBalOpts, getWalletBalHandler);
  // initialize Add Balance transaction
  fastify.post<AddBalInitRequest>('/addBalanceInit', AddBalInitOpts, addBalInitHandler);
  // finalize Add Balance transaction
  fastify.post<AddBalEndRequest>('/addBalanceEnd', AddBalEndOpts, addBalEndHandler);
  // initialize Pay Contest transaction
  fastify.post<PayContestRequest>('/payContest', PayContestOpts, payContestHandler);
};

export default walletRoute;
