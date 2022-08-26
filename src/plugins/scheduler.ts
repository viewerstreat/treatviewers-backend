import fp from 'fastify-plugin';
import FastifySchedule from '@fastify/schedule';
import {AsyncTask, SimpleIntervalJob} from 'toad-scheduler';
import {COLL_OTPS, COLL_USED_TOKENS} from '../utils/constants';
import {
  CLEANUP_INTERVAL,
  CLEANUP_TASK_ID,
  CONTEST_TASK_ID,
  NOTI_INTERVAL,
  NOTI_TASK_ID,
  SCHEDULER_INTERVAL,
  TOKEN_CLEANUP_DRURATION,
} from '../utils/config';
import {OtpSchema, UsedTokenSchema} from '../models/user';
import {checkAndFinalizeContest} from '../utils/contestService';
import {handleNotification} from '../utils/notiService';

export default fp(async (fastify, opts) => {
  // handler function for the async task
  // finds all eligible contests
  // finish all contests
  const taskHandler = async () => {
    fastify.log.info('scheduler taskHandler called...');
    try {
      await checkAndFinalizeContest(fastify);
    } catch (err) {
      fastify.log.error(err);
    }
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
    try {
      const collOtp = fastify.mongo.db?.collection<OtpSchema>(COLL_OTPS);
      const collToken = fastify.mongo.db?.collection<UsedTokenSchema>(COLL_USED_TOKENS);
      const cutOff = fastify.getCurrentTimestamp() - TOKEN_CLEANUP_DRURATION * 24 * 3600 * 1000;
      await collOtp?.deleteMany({validTill: {$lt: cutOff}});
      await collToken?.deleteMany({updateTs: {$lt: cutOff}});
    } catch (err) {
      fastify.log.error(err);
    }
  };

  // error handler function for the async task
  const cleanupErrorHandler = (err: Error) => {
    fastify.log.error('Error in cleanup jon...');
    fastify.log.error(err);
  };

  // handler function for notification job
  const notificationTaskHandler = async () => {
    fastify.log.info('notification taskHandler called...');
    try {
      await handleNotification(fastify);
    } catch (err) {
      fastify.log.error(err);
    }
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
