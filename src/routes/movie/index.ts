import {FastifyPluginAsync} from 'fastify';
import {
  addMovieViewHandler,
  createMovieHandler,
  getAllMoviesHandler,
  getMovieDetailHandler,
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
} from './movie.schema';

const movieRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // get all movies list
  fastify.get<GetMoviesRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...GetMoviesRequestOpts},
    (request, reply) => getAllMoviesHandler(request, reply, fastify),
  );

  // create movie
  fastify.post<CreateMovieRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...CreateMovieRequestOpts},
    (request, reply) => createMovieHandler(request, reply, fastify),
  );

  // add movie view
  fastify.post<AddViewRequest>(
    '/addView',
    {onRequest: [fastify.authenticate], ...AddViewReqOpts},
    (request, reply) => addMovieViewHandler(request, reply, fastify),
  );

  // get movie details
  fastify.get<GetMovieDetailRequest>('/details', GetMovieDetailReqOpts, (request, reply) =>
    getMovieDetailHandler(request, reply, fastify),
  );
};

export default movieRoute;
