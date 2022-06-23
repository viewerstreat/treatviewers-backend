import fp from 'fastify-plugin';
import {COLL_SEQUENCES} from '../utils/constants';

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

interface SequenceSchema {
  _id: string;
  val: number;
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  // decorator function to generate next val of a sequence
  fastify.decorate('getSequenceNextVal', async function (sequenceId: string): Promise<number> {
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
    someSupport(): string;
    getSequenceNextVal(sequenceId: string): Promise<number>;
  }
}
