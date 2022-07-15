import fp from 'fastify-plugin';
import {ObjectId} from '@fastify/mongodb';
import {Filter, Sort} from 'mongodb';
import FastifySchedule from '@fastify/schedule';
import {AsyncTask, SimpleIntervalJob} from 'toad-scheduler';
import {ContestSchema, CONTEST_STATUS, PRIZE_SELECTION} from '../models/contest';
import {
  COLL_CONTESTS,
  COLL_PLAY_TRACKERS,
  COLL_USERS,
  COLL_WALLETS,
  COLL_WALLET_TRANSACTIONS,
} from '../utils/constants';
import {PlayTrackerSchema, PLAY_STATUS} from '../models/playTracker';
import {FastifyInstance} from 'fastify';
import {SCHEDULER_INTERVAL, TRANSACTION_OPTS} from '../utils/config';
import {
  TRANSACTION_STATUS,
  WalletSchema,
  WalletTransactionSchema,
  WALLET_TRANSACTION_TYPE,
} from '../models/wallet';
import {UserSchema} from '../models/user';

const TASK_ID = 'SCHEDULER_TASK';
const FETCH_LIMIT = 10;

// sort playTrackers based on score, timeTaken and start time
const sortPlayTracker = (e1: PlayTrackerSchema, e2: PlayTrackerSchema): 1 | -1 | 0 => {
  // score descending sort
  const score1 = e1.score || 0;
  const score2 = e2.score || 0;
  if (score1 < score2) return 1;
  if (score1 > score2) return -1;
  // timeTaken ascending sort
  const timeTaken1 = e1.timeTaken || 0;
  const timeTaken2 = e2.timeTaken || 0;
  if (timeTaken1 < timeTaken2) return -1;
  if (timeTaken1 > timeTaken2) return 1;
  // start time ascending sort
  const start1 = e1.startTs || 0;
  const start2 = e1.startTs || 0;
  if (start1 < start2) return -1;
  if (start1 > start2) return 1;
  return 0;
};

// get total number of winners of the contest based on prize selection strategy
// if prize selection strategy is ratio based then total count is calculated based
// on the numerator and denominator value
const getWinnerCount = (contest: ContestSchema, totalPlayer: number): number => {
  if (contest.prizeSelection === PRIZE_SELECTION.TOP_WINNERS) {
    return contest.topWinnersCount || 0;
  }

  const numerator = contest.prizeRatioNumerator || 0;
  const denominator = contest.prizeRatioDenominator || 1;
  return Math.round((numerator * totalPlayer) / denominator);
};

async function finishContest(contest: ContestSchema, fastify: FastifyInstance) {
  {
    // log some info for debugging purposes
    const message = `Executing finish contest for Id: ${contest._id}, title: ${contest.title}`;
    fastify.log.info(message);
  }
  // start a mongo session
  const session = fastify.mongo.client.startSession();
  const collContest = fastify.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const collPT = fastify.mongo.db?.collection<PlayTrackerSchema>(COLL_PLAY_TRACKERS);
  const collWallet = fastify.mongo.db?.collection<WalletSchema>(COLL_WALLETS);
  const collT = fastify.mongo.db?.collection<WalletTransactionSchema>(COLL_WALLET_TRANSACTIONS);
  const collUser = fastify.mongo.db?.collection<UserSchema>(COLL_USERS);
  const updatedTs = fastify.getCurrentTimestamp();

  // credit prize value to user's wallet and insert into wallet transaction
  const creditPrizeValue = async (userId: number, prizeValue: number) => {
    // update the wallet document and increase balance
    const res = await collWallet?.findOneAndUpdate(
      {userId},
      {$inc: {balance: prizeValue}, $set: {updatedTs}},
      {upsert: true, session, returnDocument: 'before'},
    );
    // if the update result is not ok then throw error
    if (!res?.ok) {
      const msg = `Not able to update the balance for user: ${userId}, prizeValue: ${prizeValue}`;
      throw new Error(msg);
    }
    // get balanceBefore value
    const balanceBefore = res?.value?.balance || 0;
    const remarks = `Credit prize value ${prizeValue}`;
    // insert into walletTransaction collection
    const insertResult = await collT?.insertOne({
      userId,
      transactionType: WALLET_TRANSACTION_TYPE.CONTEST_WIN,
      amount: prizeValue,
      balanceBefore,
      balanceAfter: balanceBefore + prizeValue,
      status: TRANSACTION_STATUS.COMPLETED,
      remarks,
      createdTs: updatedTs,
      updatedTs,
    });
    // if the insert was not successful then throw error
    if (!insertResult?.insertedId) {
      const msg = `Not able to insert into walletTransactions for user: ${userId}, amount: ${prizeValue}`;
      throw new Error(msg);
    }
  };

  // withTransaction function
  const withTransactionCallback = async () => {
    // find all playTrackers for the contest
    const filter: Filter<PlayTrackerSchema> = {
      contestId: contest._id?.toString(),
      status: {$in: [PLAY_STATUS.PAID, PLAY_STATUS.STARTED, PLAY_STATUS.FINISHED]},
    };
    const playTrackers = (await collPT?.find(filter).toArray()) || [];
    // populate timeTaken and status = ENDED
    playTrackers?.forEach((e) => {
      const finish = e.finishTs || e.updatedTs || Number.MAX_SAFE_INTEGER;
      const start = e.startTs || fastify.getCurrentTimestamp();
      e.timeTaken = finish - start;
      e.status = PLAY_STATUS.ENDED;
    });
    const totalPlayed = playTrackers?.length || 0;
    // get no of winners
    const winnersCount = getWinnerCount(contest, totalPlayed);
    // sort playTrackers so that winners can be selected
    playTrackers?.sort(sortPlayTracker);
    // populate rank if there is valid score
    playTrackers?.forEach((e, idx) => {
      if (e.score && e.score > 0) {
        e.rank = idx + 1;
      }
    });
    // get all winners
    const winners = playTrackers?.filter((e) => e.rank && e.rank < winnersCount);

    // credit prize value to wallet
    const prizeValue = contest.prizeValue || 0;
    const allPromises = winners.map((e) => creditPrizeValue(e.userId, prizeValue));
    await Promise.all(allPromises);

    // update all playTrackers status = ENDED
    await collPT?.updateMany(filter, {$set: {status: PLAY_STATUS.ENDED, updatedTs}}, {session});
    // update the contest instance
    await collContest?.updateOne(
      {_id: new ObjectId(contest._id)},
      {
        $set: {
          status: CONTEST_STATUS.ENDED,
          winners,
          allPlayTrackers: playTrackers,
          updatedTs,
        },
      },
      {session},
    );

    // update totalPlayed
    const allUsers = playTrackers.map((e) => e.userId);
    await collUser?.updateMany(
      {id: {$in: allUsers}},
      {$inc: {totalPlayed: 1}, $set: {updatedTs}},
      {session},
    );
    // update contestWon, totalEarning
    const allWinners = winners.map((e) => e.userId);
    await collUser?.updateMany(
      {id: {$in: allWinners}},
      {$inc: {contestWon: 1, totalEarning: prizeValue}, $set: {updatedTs}},
      {session},
    );
  };
  try {
    const result = await session.withTransaction(withTransactionCallback, TRANSACTION_OPTS);
    if (!result) {
      throw new Error('Unknown error occurred executing transaction');
    }
  } catch (err) {
    fastify.log.error(err);
    session.abortTransaction();
  } finally {
    session.endSession();
  }
}

export default fp(async (fastify, opts) => {
  // handler function for the async task
  // finds all eligible contests
  // finish all contests
  const taskHandler = async () => {
    fastify.log.info('scheduler taskHandler called...');
    const collContest = fastify.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
    // fetch contests that are ACTIVE and endTime is already over
    const filter: Filter<ContestSchema> = {
      status: CONTEST_STATUS.ACTIVE,
      endTime: {$lte: fastify.getCurrentTimestamp()},
    };
    // fetched in updateTs ascending order so that oldest contest updated first
    const sort: Sort = {updatedTs: 1};
    let contests = await collContest?.find(filter).sort(sort).limit(FETCH_LIMIT).toArray();
    contests = contests || [];
    // finish contest for all eligible contests
    await Promise.all(contests.map((c) => finishContest(c, fastify)));
  };

  // error handler function for the async task
  const errorHandler = (err: Error) => {
    fastify.log.error('Error in scheduler...');
    fastify.log.error(err);
  };

  const task = new AsyncTask(TASK_ID, taskHandler, errorHandler);
  const job = new SimpleIntervalJob({seconds: SCHEDULER_INTERVAL}, task);
  fastify.register(FastifySchedule);
  fastify.ready().then(() => {
    fastify.scheduler.addSimpleIntervalJob(job);
  });
});

declare module 'fastify' {
  export interface FastifyRequest {}
  export interface FastifyInstance {}
}
