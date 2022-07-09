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
  fastify.post<UpdateFavouriteRequest>('/', UpdateFavouriteReqOpts, updateFavouriteHandler);

  // get favourite list
  fastify.get<GetFavouriteRequest>('/', GetFavouriteReqOpts, getFavouriteHandler);
};

export default favouriteRoute;
