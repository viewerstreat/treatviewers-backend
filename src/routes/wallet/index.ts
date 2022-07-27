import {FastifyPluginAsync} from 'fastify';
import {
  addBalEndHandler,
  addBalInitHandler,
  getWalletBalHandler,
  payContestHandler,
  withdrawBalEndHandler,
  withdrawBalInitHandler,
} from './wallet.handler';
import {
  AddBalEndOpts,
  AddBalEndRequest,
  AddBalInitOpts,
  AddBalInitRequest,
  GetWalletBalOpts,
  PayContestOpts,
  PayContestRequest,
  WithdrawBalEndOpts,
  WithdrawBalEndRequest,
  WithdrawBalInitOpts,
  WithdrawBalInitReq,
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
  // initialize Withdraw balance transaction
  fastify.post<WithdrawBalInitReq>('/withdrawBalInit', WithdrawBalInitOpts, withdrawBalInitHandler);
  // finalize Withdraw Balance transaction
  fastify.post<WithdrawBalEndRequest>(
    '/withdrawBalanceEnd',
    WithdrawBalEndOpts,
    withdrawBalEndHandler,
  );
};

export default walletRoute;
