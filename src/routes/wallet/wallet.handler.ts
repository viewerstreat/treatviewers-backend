import {ObjectId} from '@fastify/mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {Filter, UpdateFilter} from 'mongodb';
import {ContestSchema, CONTEST_STATUS} from '../../models/contest';
import {PlayTrackerSchema, PLAY_STATUS} from '../../models/playTracker';
import {
  TRANSACTION_STATUS,
  WalletSchema,
  WalletTransactionSchema,
  WALLET_TRANSACTION_TYPE,
} from '../../models/wallet';
import {TRANSACTION_OPTS} from '../../utils/config';
import {
  COLL_CONTESTS,
  COLL_PLAY_TRACKERS,
  COLL_WALLETS,
  COLL_WALLET_TRANSACTIONS,
} from '../../utils/constants';
import {AddBalEndRequest, AddBalInitRequest, PayContestRequest} from './wallet.schema';

// get user's current wallet balance
// if there is no record exists in the collection
// then this function returns 0
const getUserBalance = async (request: FastifyRequest): Promise<number> => {
  const coll = request.mongo.db?.collection<WalletSchema>(COLL_WALLETS);
  const res = await coll?.findOne({userId: request.user.id});
  return res?.balance || 0;
};

// handler function for get wallet balance route
export const getWalletBalHandler = async (request: FastifyRequest) => {
  const balance = await getUserBalance(request);
  return {success: true, balance};
};

// handler function for add balance init route
// checks if there is any pending transaction exists for the user
// if exists then returns 409 error status
// otherwise creates a new transactionId
type AddBalInitFastifyReq = FastifyRequest<AddBalInitRequest>;
export const addBalInitHandler = async (request: AddBalInitFastifyReq, reply: FastifyReply) => {
  const coll = request.mongo.db?.collection<WalletTransactionSchema>(COLL_WALLET_TRANSACTIONS);
  // check for exists transaction with PENDING status
  const result = await coll?.findOne({status: TRANSACTION_STATUS.PENDING});
  if (result) {
    reply.status(409).send({success: false, message: 'PENDING transaction exists for user'});
    return;
  }
  // round off the decimal places
  const amount = Math.round(request.body.amount);
  // get balanceBefore field value
  const balance = await getUserBalance(request);
  const doc: WalletTransactionSchema = {
    userId: request.user.id,
    transactionType: WALLET_TRANSACTION_TYPE.ADD_BALANCE,
    amount,
    balanceBefore: balance,
    status: TRANSACTION_STATUS.PENDING,
    createdTs: request.getCurrentTimestamp(),
  };
  const res = await coll?.insertOne(doc);
  // return the transactionId in the response
  return {success: true, transactionId: res?.insertedId};
};

// handler function for add balance finalize route
// expects a valid transactionId
// isSuccessful is a mandatory field in request body
// if isSuccessful is false then it just updates the transaction and returns 200
// otherwise update the wallet balance and update the transaction status to COMPLETED
// within a session transaction
type AddBalEndFastifyReq = FastifyRequest<AddBalEndRequest>;
export const addBalEndHandler = async (request: AddBalEndFastifyReq, reply: FastifyReply) => {
  const walletColl = request.mongo.db?.collection<WalletSchema>(COLL_WALLETS);
  const coll = request.mongo.db?.collection<WalletTransactionSchema>(COLL_WALLET_TRANSACTIONS);
  const filter: Filter<WalletTransactionSchema> = {_id: new ObjectId(request.body.transactionId)};
  const transactionDoc = await coll?.findOne(filter);
  // check for valid transactionId
  if (!transactionDoc) {
    reply.status(404).send({success: false, message: 'transaction not found'});
    return;
  }
  // check for transaction status
  if (transactionDoc.status !== TRANSACTION_STATUS.PENDING) {
    reply.status(409).send({success: false, message: 'transaction status is not PENDING'});
    return;
  }
  // update the transaction to error
  if (request.body.isSuccessful === false) {
    await coll?.updateOne(filter, {
      $set: {
        status: TRANSACTION_STATUS.ERROR,
        errorReason: request.body.errorReason,
        trackingId: request.body.trackingId,
      },
    });
    return {success: true, message: 'updated successfully'};
  }

  // round off decimal places
  const amount = Math.round(request.body.amount);
  // if the amount do not match then return 409
  if (amount !== transactionDoc.amount) {
    reply.status(409).send({success: false, message: 'amount do not match'});
    return;
  }

  const balance = await getUserBalance(request);
  // check balanceBefore value matches
  if (transactionDoc?.balanceBefore !== balance) {
    reply.status(409).send({
      success: false,
      message: `balance(${balance}) do not match with transaction balanceBefore(${transactionDoc?.balanceBefore}) field`,
    });
    return;
  }
  // start session for mongo transaction
  const session = request.mongo.client.startSession();
  let isError = false;
  let errorMessage = '';
  let transactionResult = undefined;
  const updatedTs = request.getCurrentTimestamp();
  try {
    transactionResult = await session.withTransaction(async () => {
      // increase user wallet balance
      const updtRslt = await walletColl?.findOneAndUpdate(
        {userId: request.user.id},
        {$inc: {balance: transactionDoc?.amount}, $set: {updatedTs}},
        {upsert: true, session, returnDocument: 'after'},
      );
      // throw error if wallet balance update is unsuccessful
      if (!updtRslt?.ok) {
        throw new Error('Not able to update wallet balance, aborting.');
      }
      const balanceAfter = updtRslt.value?.balance;
      const update: UpdateFilter<WalletTransactionSchema> = {
        $set: {
          balanceAfter,
          status: TRANSACTION_STATUS.COMPLETED,
          trackingId: request.body.trackingId,
          updatedTs,
        },
      };
      // update the trasanction with COMPLETED status
      const rslt = await coll?.updateOne(filter, update, {session});
      const modifiedCount = rslt?.modifiedCount || 0;
      if (modifiedCount === 0) {
        throw new Error('Not able to update transaction');
      }
    }, TRANSACTION_OPTS);
  } catch (err: any) {
    transactionResult = undefined;
    isError = true;
    errorMessage = err.toString();
  } finally {
    session.endSession();
  }
  // if any error occurred during the transaction update the
  // transaction with ERROR status and errorReason
  if (isError && errorMessage) {
    coll?.updateOne(filter, {
      $set: {
        status: TRANSACTION_STATUS.ERROR,
        errorReason: errorMessage,
        updatedTs: request.getCurrentTimestamp(),
      },
    });
    reply.status(409).send({success: false, message: errorMessage});
    return;
  }

  // if for some reason transactionResult is an empty object return error status
  if (!transactionResult) {
    reply.status(409).send({success: false, message: 'Unknown error occurred'});
    return;
  }

  // return successful response when all is fine
  return {success: true, message: 'Updated successfully'};
};

// handler function for Pay Contest route
// check for valid contestId
// check for wallet balance > entry Fee
// if the playTracker already exists and status is STARTED or FINISHED
// then return 409
// if playTracker is not created for the contestId and userId
// then create playTracker and update status to PAID
type PayContestFstReq = FastifyRequest<PayContestRequest>;
export const payContestHandler = async (request: PayContestFstReq, reply: FastifyReply) => {
  const collContest = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const collPlayTracker = request.mongo.db?.collection<PlayTrackerSchema>(COLL_PLAY_TRACKERS);
  const collWallet = request.mongo.db?.collection<WalletSchema>(COLL_WALLETS);
  const collTrans = request.mongo.db?.collection<WalletTransactionSchema>(COLL_WALLET_TRANSACTIONS);
  const userId = request.user.id;
  const {contestId} = request.body;
  // check if the contestId is valid
  const filter: Filter<ContestSchema> = {
    _id: new ObjectId(contestId),
    status: CONTEST_STATUS.ACTIVE,
    endTime: {$gt: request.getCurrentTimestamp()},
  };
  const contest = await collContest?.findOne(filter);
  if (!contest) {
    reply.status(404).send({success: false, message: 'contest not found'});
    return;
  }
  // check if the playTracker exists for the userId and contestId
  const playTracker = await collPlayTracker?.findOne({contestId, userId});
  if (playTracker && playTracker.status === PLAY_STATUS.FINISHED) {
    reply.status(409).send({success: false, message: 'contest already finished for user'});
    return;
  }
  if (playTracker && playTracker.status === PLAY_STATUS.STARTED) {
    reply.status(409).send({success: false, message: 'contest already started for user'});
    return;
  }
  if (playTracker && playTracker.status === PLAY_STATUS.PAID) {
    reply.status(409).send({success: false, message: 'contest already paid for user'});
    return;
  }
  // if the playTracker do not exists then insert in INIT status
  if (!playTracker) {
    await collPlayTracker?.insertOne({
      contestId,
      userId,
      status: PLAY_STATUS.INIT,
      initTs: request.getCurrentTimestamp(),
      createdTs: request.getCurrentTimestamp(),
    });
  }
  // start a session
  const session = request.mongo.client.startSession();
  const updatedTs = request.getCurrentTimestamp();
  const entryFee = contest.entryFee || 0;
  try {
    const transactionResult = await session.withTransaction(async () => {
      // get balanceBefore value before subtracting entryFee
      const balanceBefore = await getUserBalance(request);
      // if balance is less than entryFee then throw error
      if (balanceBefore < entryFee) {
        throw new Error('Insufficient balance');
      }
      let balanceAfter = 0;
      // subtract wallet balance
      if (entryFee > 0) {
        // update the wallet collection and decrement balance
        const updtRslt = await collWallet?.findOneAndUpdate(
          {userId, balance: {$gte: contest.entryFee}},
          {$inc: {balance: -1 * entryFee}, $set: {updatedTs}},
          {session, upsert: false, returnDocument: 'after'},
        );
        // check if update executed properly
        if (!updtRslt?.ok) {
          throw new Error('Not able to update wallet balance.');
        }
        // balanceAfter value from the returnDocument value
        balanceAfter = updtRslt.value?.balance || 0;
      }
      // insert into walletTransaction with status COMPLETED
      const insRslt = await collTrans?.insertOne(
        {
          userId,
          transactionType: WALLET_TRANSACTION_TYPE.PAY_FOR_CONTEST,
          amount: entryFee,
          status: TRANSACTION_STATUS.COMPLETED,
          balanceBefore,
          balanceAfter,
          remarks: `Pay for contest ${contestId}`,
          createdTs: updatedTs,
          updatedTs,
        },
        {session},
      );
      const walletTransactionId = insRslt?.insertedId.toString() || undefined;
      // check if the insert operation failed
      if (!walletTransactionId) {
        throw new Error('not able to insert into walletTransaction');
      }
      // update the playTracker to PAID
      const updtRslt = await collPlayTracker?.updateOne(
        {contestId, userId},
        {
          $set: {
            status: PLAY_STATUS.PAID,
            paidTs: updatedTs,
            walletTransactionId,
            updatedTs,
          },
        },
        {session, upsert: false},
      );
      // check if the update operation failed
      const modifiedCount = updtRslt?.modifiedCount || 0;
      if (modifiedCount !== 1) {
        throw new Error('not able to update playTracker');
      }
    }, TRANSACTION_OPTS);
    if (!transactionResult) {
      reply.status(409).send({success: false, message: 'Unknown error occurred'});
      return;
    }
    // return success reponse
    return {success: true, message: 'Updated successfully'};
  } catch (err: any) {
    request.log.error(err);
    reply.status(409).send({success: false, message: err.toString()});
  } finally {
    session.endSession();
  }
};
