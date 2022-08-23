import fp from 'fastify-plugin';
import {Filter, Sort} from 'mongodb';
import FastifySchedule from '@fastify/schedule';
import {AsyncTask, SimpleIntervalJob} from 'toad-scheduler';
import {ContestSchema, CONTEST_STATUS} from '../models/contest';
import {COLL_CONTESTS, COLL_OTPS, COLL_USED_TOKENS} from '../utils/constants';
import {
  BATCH_FETCH_LIMIT,
  CLEANUP_INTERVAL,
  CLEANUP_TASK_ID,
  CONTEST_TASK_ID,
  NOTI_INTERVAL,
  NOTI_TASK_ID,
  SCHEDULER_INTERVAL,
  TOKEN_CLEANUP_DRURATION,
} from '../utils/config';
import {OtpSchema, UsedTokenSchema} from '../models/user';
import {finishContest} from '../utils/finalizePlay';
import {handleNotification} from '../utils/notiService';

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
    let contests = await collContest?.find(filter).sort(sort).limit(BATCH_FETCH_LIMIT).toArray();
    contests = contests || [];
    // finish contest for all eligible contests
    await Promise.all(contests.map((c) => finishContest(c, fastify)));
  };

  // error handler function for the async task
  const errorHandler = (err: Error) => {
    fastify.log.error('Error in scheduler...');
    fastify.log.error(err);
  };

  // handler function for the async task
  // finds all eligible contests
  // finish all contests
  const cleanUpTaskHandler = async () => {
    fastify.log.info('cleanup taskHandler called...');
    const collOtp = fastify.mongo.db?.collection<OtpSchema>(COLL_OTPS);
    const collToken = fastify.mongo.db?.collection<UsedTokenSchema>(COLL_USED_TOKENS);
    const cutOff = fastify.getCurrentTimestamp() - TOKEN_CLEANUP_DRURATION * 24 * 3600 * 1000;
    await collOtp?.deleteMany({validTill: {$lt: cutOff}});
    await collToken?.deleteMany({updateTs: {$lt: cutOff}});
  };

  // error handler function for the async task
  const cleanupErrorHandler = (err: Error) => {
    fastify.log.error('Error in cleanup jon...');
    fastify.log.error(err);
  };

  // handler function for notification job
  const notificationTaskHandler = async () => {
    fastify.log.info('notification taskHandler called...');
    handleNotification(fastify);
  };

  const task = new AsyncTask(CONTEST_TASK_ID, taskHandler, errorHandler);
  const job = new SimpleIntervalJob({seconds: SCHEDULER_INTERVAL}, task);

  const cleanupTask = new AsyncTask(CLEANUP_TASK_ID, cleanUpTaskHandler, cleanupErrorHandler);
  const cleanupJob = new SimpleIntervalJob({hours: CLEANUP_INTERVAL}, cleanupTask);

  const notiTask = new AsyncTask(NOTI_TASK_ID, notificationTaskHandler, errorHandler);
  const notiJob = new SimpleIntervalJob({seconds: NOTI_INTERVAL}, notiTask);

  fastify.register(FastifySchedule);
  fastify.ready().then(() => {
    fastify.scheduler.addSimpleIntervalJob(job);
    fastify.scheduler.addSimpleIntervalJob(cleanupJob);
    fastify.scheduler.addSimpleIntervalJob(notiJob);
  });
});

declare module 'fastify' {
  export interface FastifyRequest {}
  export interface FastifyInstance {}
}
