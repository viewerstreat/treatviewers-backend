import {FastifyPluginAsync} from 'fastify';
import {getFavouriteHandler, updateFavouriteHandler} from './favourite.handler';
import {
  GetFavouriteReqOpts,
  GetFavouriteRequest,
  UpdateFavouriteReqOpts,
  UpdateFavouriteRequest,
} from './favourite.schema';

const favouriteRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // update favourite
  fastify.post<UpdateFavouriteRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...UpdateFavouriteReqOpts},
    (request, reply) => updateFavouriteHandler(request, reply, fastify),
  );

  // get favourite list
  fastify.get<GetFavouriteRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...GetFavouriteReqOpts},
    (request, reply) => getFavouriteHandler(request, reply, fastify),
  );
};

export default favouriteRoute;
