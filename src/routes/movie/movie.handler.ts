import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {Filter, Sort} from 'mongodb';
import {FavouriteSchema, MEDIA_TYPE, MovieSchema, MovieViewSchema} from '../../models/movie';
import {COLL_FAVOURITES, COLL_MOVIES, COLL_MOVIE_VIEWS} from '../../utils/constants';
import {
  AddViewRequest,
  CreateMovieRequest,
  GetMovieDetailRequest,
  GetMoviesRequest,
} from './movie.schema';

export const getAllMoviesHandler = async (
  request: FastifyRequest<GetMoviesRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  // generate the findBy query
  const findBy: Filter<MovieSchema> = {
    isActive: true,
    moviePromotionExpiry: {$gt: fastify.getCurrentTimestamp()},
  };
  // filter by _id if it is passed in the query parameters
  if (request.query._id) {
    let oid = new fastify.mongo.ObjectId(request.query._id);
    findBy._id = oid;
  }

  const sortBy: Sort = {_id: -1};
  const pageNo = request.query.pageNo || 0;
  const pageSize = request.query.pageSize || fastify.getDefaultPageSize();
  const result = await fastify.mongo.db
    ?.collection<MovieSchema>(COLL_MOVIES)
    .find(findBy)
    .skip(pageNo * pageSize)
    .limit(pageSize)
    .sort(sortBy)
    .toArray();
  return {success: true, data: result};
};

export const createMovieHandler = async (
  request: FastifyRequest<CreateMovieRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const collection = fastify.mongo.db?.collection<MovieSchema>(COLL_MOVIES);
  const doc: MovieSchema = {
    name: request.body.name,
    description: request.body.description,
    tags: request.body.tags,
    bannerImageUrl: request.body.bannerImageUrl,
    videoUrl: request.body.videoUrl,
    sponsoredBy: request.body.sponsoredBy,
    sponsoredByLogo: request.body.sponsoredByLogo,
    releaseDate: request.body.releaseDate,
    releaseOutlets: request.body.releaseOutlets,
    moviePromotionExpiry: request.body.moviePromotionExpiry || fastify.getDefaultPromoExpiry(),
    viewCount: 0,
    likeCount: 0,
    isActive: true,
    createdBy: request.user.id,
    createdTs: fastify.getCurrentTimestamp(),
  };
  const result = await collection?.insertOne(doc);
  const data: MovieSchema = {
    _id: result?.insertedId,
    ...doc,
  };
  return {success: true, data};
};

const getMovieData = async (
  movieId: string,
  fastify: FastifyInstance,
): Promise<MovieSchema | null> => {
  const collMovie = fastify.mongo.db?.collection<MovieSchema>(COLL_MOVIES);
  const movieData = await collMovie?.findOne({_id: new fastify.mongo.ObjectId(movieId)});
  return movieData || null;
};

const getMovieViewCount = async (movieId: string, fastify: FastifyInstance): Promise<number> => {
  const coll = fastify.mongo.db?.collection<MovieViewSchema>(COLL_MOVIE_VIEWS);
  const count = await coll?.countDocuments({movieId});
  return count || 0;
};

const getMovieLikeCount = async (movieId: string, fastify: FastifyInstance): Promise<number> => {
  const coll = fastify.mongo.db?.collection<FavouriteSchema>(COLL_FAVOURITES);
  const count = await coll?.countDocuments({mediaId: movieId, mediaType: MEDIA_TYPE.MOVIE});
  return count || 0;
};

const getIsLikedByMe = async (
  movieId: string,
  userId: number,
  fastify: FastifyInstance,
): Promise<boolean> => {
  const coll = fastify.mongo.db?.collection<FavouriteSchema>(COLL_FAVOURITES);
  const res = await coll?.findOne({mediaId: movieId, userId, mediaType: MEDIA_TYPE.MOVIE});
  return !!res;
};

export const getMovieDetailHandler = async (
  request: FastifyRequest<GetMovieDetailRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const {movieId} = request.query;
  const [movieData, viewCount, likeCount, isLikedByMe] = await Promise.all([
    getMovieData(movieId, fastify),
    getMovieViewCount(movieId, fastify),
    getMovieLikeCount(movieId, fastify),
    getIsLikedByMe(movieId, request.user.id, fastify),
  ]);

  if (!movieData) {
    reply.status(404).send({success: false, message: 'Movie not found'});
    return;
  }
  movieData.viewCount = viewCount;
  movieData.likeCount = likeCount;
  movieData.isLikedByMe = isLikedByMe;
  return {success: true, data: movieData};
};

export const addMovieViewHandler = async (
  request: FastifyRequest<AddViewRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  const collMovie = fastify.mongo.db?.collection<MovieSchema>(COLL_MOVIES);
  const movieData = await collMovie?.findOne({
    _id: new fastify.mongo.ObjectId(request.body.movieId),
  });
  if (!movieData) {
    reply.status(404).send({success: false, message: 'Movie not found'});
    return;
  }
  const coll = fastify.mongo.db?.collection<MovieViewSchema>(COLL_MOVIE_VIEWS);
  await coll?.findOneAndUpdate(
    {
      movieId: request.body.movieId,
      userId: request.user.id,
    },
    {
      $set: {
        movieId: request.body.movieId,
        userId: request.user.id,
        updatedTs: fastify.getCurrentTimestamp(),
      },
    },
    {
      upsert: true,
    },
  );
  return {success: true, message: 'Updated successfully'};
};
