import {FastifyInstance} from 'fastify';
import {ObjectId} from '@fastify/mongodb';
import {Filter, Sort} from 'mongodb';
import {ContestSchema, CONTEST_STATUS} from '../models/contest';
import {PlayTrackerSchema, PLAY_STATUS} from '../models/playTracker';
import {UserSchema} from '../models/user';
import {
  TRANSACTION_STATUS,
  WalletSchema,
  WalletTransactionSchema,
  WALLET_TRANSACTION_TYPE,
} from '../models/wallet';
import {
  COLL_CONTESTS,
  COLL_PLAY_TRACKERS,
  COLL_USERS,
  COLL_WALLETS,
  COLL_WALLET_TRANSACTIONS,
} from './constants';
import {BATCH_FETCH_LIMIT, TRANSACTION_OPTS} from './config';
import {createPushForPrize, getWinnerCount, sortPlayTracker} from './contestUtils';

// fetch the list of contest which are ended
// calculate the prizes for each participants for each contest
// mark the contest and ended
async function checkAndFinalizeContest(fastify: FastifyInstance) {
  const collContest = fastify.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  // fetch contests that are ACTIVE and endTime is already over
  const filter: Filter<ContestSchema> = {
    status: CONTEST_STATUS.ACTIVE,
    endTime: {$lte: fastify.getCurrentTimestamp()},
  };
  // fetched in updateTs ascending order so that oldest contest updated first
  const sort: Sort = {updatedTs: 1};
  let contests = await collContest?.find(filter).sort(sort).limit(BATCH_FETCH_LIMIT).toArray();
  contests = contests || [];
  // finish contest for all eligible contests
  await Promise.all(contests.map((c) => finishContest(c, fastify)));
}

// for each ended contest calculate prize and update user's balance
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
    const remarks = `Credit prize value ${prizeValue} for contest ${contest._id}`;
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
    await createPushForPrize(userId, prizeValue, contest.title || '', fastify);
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
    if (prizeValue > 0) {
      const allPromises = winners.map((e) => creditPrizeValue(e.userId, prizeValue));
      await Promise.all(allPromises);
    }

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

export {finishContest, checkAndFinalizeContest};

/**
 *
 * Leaderboard (Unauthenticated API)
 * fetch from users collection
 * where totalPlayed > 0
 * sort by
 * totalEarning desc
 * contestWon desc
 * totalPlayed desc
 * name asc
 *
 *
 */

/**
 * Your results (authenticated API)
 * fetch from contest collection
 * where status = ENDED
 * and allPlayTrackers.userId = userId
 * sort by updatedTs desc
 *
 */
