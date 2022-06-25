import {FastifyPluginAsync} from 'fastify';
import {createMovieHandler, getAllMoviesHandler} from './movie.handler';
import {
  GetMoviesRequestOpts,
  GetMoviesRequest,
  CreateMovieRequest,
  CreateMovieRequestOpts,
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
};

export default movieRoute;
