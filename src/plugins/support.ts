import fp from 'fastify-plugin';
import {SequenceSchema} from '../models/sequence';
import {DEFAULT_PAGE_SIZE, MOVIE_EXPIRY_DAYS} from '../utils/config';
import {COLL_SEQUENCES} from '../utils/constants';

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  // decorator function to get current unix timestamp
  fastify.decorate('getCurrentTimestamp', (): number => {
    return new Date().getTime();
  });

  // decorator function to get default page size
  fastify.decorate('getDefaultPageSize', (): number => {
    return DEFAULT_PAGE_SIZE;
  });

  // decorator function to get default movie promotion expiry timestmp
  fastify.decorate('getDefaultMoviePromoExpiry', (): number => {
    return new Date().getTime() + MOVIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  });

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
    getSequenceNextVal(sequenceId: string): Promise<number>;
    getCurrentTimestamp(): number;
    getDefaultPageSize(): number;
    getDefaultMoviePromoExpiry(): number;
  }
}
