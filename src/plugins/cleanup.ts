import fp from 'fastify-plugin';
import FastifySchedule from '@fastify/schedule';
import {AsyncTask, SimpleIntervalJob} from 'toad-scheduler';
import {COLL_OTPS, COLL_USED_TOKENS} from '../utils/constants';
import {CLEANUP_INTERVAL, TOKEN_CLEANUP_DRURATION} from '../utils/config';
import {OtpSchema, UsedTokenSchema} from '../models/user';

const TASK_ID = 'CLEANUP_JOB';

export default fp(async (fastify, opts) => {
  // handler function for the async task
  // finds all eligible contests
  // finish all contests
  const taskHandler = async () => {
    fastify.log.info('cleanup taskHandler called...');
    const collOtp = fastify.mongo.db?.collection<OtpSchema>(COLL_OTPS);
    const collToken = fastify.mongo.db?.collection<UsedTokenSchema>(COLL_USED_TOKENS);
    const cutOff = fastify.getCurrentTimestamp() - TOKEN_CLEANUP_DRURATION * 24 * 3600 * 1000;
    await collOtp?.deleteMany({validTill: {$lt: cutOff}});
    await collToken?.deleteMany({updateTs: {$lt: cutOff}});
  };

  // error handler function for the async task
  const errorHandler = (err: Error) => {
    fastify.log.error('Error in cleanup jon...');
    fastify.log.error(err);
  };

  const task = new AsyncTask(TASK_ID, taskHandler, errorHandler);
  const job = new SimpleIntervalJob({hours: CLEANUP_INTERVAL}, task);
  fastify.register(FastifySchedule);
  fastify.ready().then(() => {
    fastify.scheduler.addSimpleIntervalJob(job);
  });
});

declare module 'fastify' {
  export interface FastifyRequest {}
  export interface FastifyInstance {}
}
