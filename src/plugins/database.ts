import fp from 'fastify-plugin';
import FastifyMongodb, {FastifyMongoNestedObject, FastifyMongoObject} from '@fastify/mongodb';
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

  fastify.addHook('preHandler', (request, reply, done) => {
    request.mongo = fastify.mongo;
    request.getSequenceNextVal = fastify.getSequenceNextVal;
    done();
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyRequest {
    mongo: FastifyMongoObject & FastifyMongoNestedObject;
    getSequenceNextVal(sequenceId: string): Promise<number>;
  }
  export interface FastifyInstance {
    getSequenceNextVal(sequenceId: string): Promise<number>;
  }
}
