import fp from 'fastify-plugin';
import FastifySchedule from '@fastify/schedule';
import {AsyncTask, SimpleIntervalJob} from 'toad-scheduler';

const TASK_ID = 'SCHEDULER_TASK';
export default fp(async (fastify, opts) => {
  const taskHandler = async () => {
    fastify.log.info('taskHandler called ...');
  };
  const errorHandler = (err: Error) => {
    fastify.log.error('Error in scheduler...');
    fastify.log.error(err);
  };
  const task = new AsyncTask(TASK_ID, taskHandler, errorHandler);
  const job = new SimpleIntervalJob({seconds: 20}, task);
  fastify.register(FastifySchedule);
  fastify.ready().then(() => {
    fastify.scheduler.addSimpleIntervalJob(job);
  });
});

declare module 'fastify' {
  export interface FastifyRequest {}
  export interface FastifyInstance {}
}
