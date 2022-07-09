import {FastifyPluginAsync} from 'fastify';
import {
  addMovieViewHandler,
  createMovieHandler,
  getAllMoviesHandler,
  getMovieDetailHandler,
  isLikedByMeHandler,
} from './movie.handler';
import {
  GetMoviesRequestOpts,
  GetMoviesRequest,
  CreateMovieRequest,
  CreateMovieRequestOpts,
  AddViewRequest,
  AddViewReqOpts,
  GetMovieDetailRequest,
  GetMovieDetailReqOpts,
  IsLikeByMeRequest,
  IsLikeByMeReqOpts,
} from './movie.schema';

const movieRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // get all movies list
  fastify.get<GetMoviesRequest>('/', GetMoviesRequestOpts, getAllMoviesHandler);

  // create movie
  fastify.post<CreateMovieRequest>('/', CreateMovieRequestOpts, createMovieHandler);

  // add movie view
  fastify.post<AddViewRequest>('/addView', AddViewReqOpts, addMovieViewHandler);

  // get movie details
  fastify.get<GetMovieDetailRequest>('/details', GetMovieDetailReqOpts, getMovieDetailHandler);

  // is movie like by me
  fastify.get<IsLikeByMeRequest>('/isLikedByMe', IsLikeByMeReqOpts, isLikedByMeHandler);
};

export default movieRoute;
