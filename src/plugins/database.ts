import fp from 'fastify-plugin';
import FastifyMongodb from '@fastify/mongodb';
import {COLL_SEQUENCES} from '../utils/constants';
import {SequenceSchema} from '../models/sequence';

export default fp(async (fastify, opts) => {
  const dbConnUrl = process.env.DB_CONN_URL;
  if (!dbConnUrl) {
    throw new Error('DB_CONN_URL not found.');
  }

  fastify.register(FastifyMongodb, {
    forceClose: true,
    url: process.env.DB_CONN_URL,
  });

  fastify.decorate('getSequenceNextVal', async (sequenceId: string): Promise<number> => {
    const result = await fastify.mongo.db
      ?.collection<SequenceSchema>(COLL_SEQUENCES)
      .findOneAndUpdate(
        {_id: sequenceId},
        {$inc: {val: 1}},
        {upsert: true, returnDocument: 'after'},
      );
    if (result?.value?.val) {
      return result.value.val;
    }
    throw new Error('not able to get next sequence value');
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    getSequenceNextVal(sequenceId: string): Promise<number>;
  }
}
