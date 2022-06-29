import fp from 'fastify-plugin';
// import {SequenceSchema} from '../models/sequence';
import {DEFAULT_PAGE_SIZE, MOVIE_EXPIRY_DAYS} from '../utils/config';
// import {COLL_SEQUENCES} from '../utils/constants';

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
  fastify.decorate('getDefaultPromoExpiry', (): number => {
    return new Date().getTime() + MOVIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    getCurrentTimestamp(): number;
    getDefaultPageSize(): number;
    getDefaultPromoExpiry(): number;
  }
}
