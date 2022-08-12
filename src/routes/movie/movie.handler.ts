import {ObjectId} from '@fastify/mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {Filter, Sort} from 'mongodb';
import {FavouriteSchema, MEDIA_TYPE, MovieSchema, MovieViewSchema} from '../../models/movie';
import {COLL_FAVOURITES, COLL_MOVIES, COLL_MOVIE_VIEWS} from '../../utils/constants';
import {
  AddViewRequest,
  CreateMovieRequest,
  GetMovieDetailRequest,
  GetMoviesRequest,
  IsLikeByMeRequest,
} from './movie.schema';

export const getAllMoviesHandler = async (request: FastifyRequest<GetMoviesRequest>) => {
  // generate the findBy query
  const findBy: Filter<MovieSchema> = {
    isActive: true,
    moviePromotionExpiry: {$gt: request.getCurrentTimestamp()},
  };
  // filter by _id if it is passed in the query parameters
  if (request.query._id) {
    findBy._id = new ObjectId(request.query._id);
  }

  const sortBy: Sort = {_id: -1};
  const pageNo = request.query.pageNo || 0;
  const pageSize = request.query.pageSize || request.getDefaultPageSize();
  const result = await request.mongo.db
    ?.collection<MovieSchema>(COLL_MOVIES)
    .find(findBy)
    .skip(pageNo * pageSize)
    .limit(pageSize)
    .sort(sortBy)
    .toArray();
  return {success: true, data: result};
};

export const createMovieHandler = async (request: FastifyRequest<CreateMovieRequest>) => {
  const collection = request.mongo.db?.collection<MovieSchema>(COLL_MOVIES);
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
    moviePromotionExpiry: request.body.moviePromotionExpiry || request.getDefaultPromoExpiry(),
    viewCount: 0,
    likeCount: 0,
    isActive: true,
    createdBy: request.user.id,
    createdTs: request.getCurrentTimestamp(),
  };
  const result = await collection?.insertOne(doc);
  const data: MovieSchema = {
    _id: result?.insertedId,
    ...doc,
  };
  return {success: true, data};
};

export const isLikedByMeHandler = async (request: FastifyRequest<IsLikeByMeRequest>) => {
  const coll = request.mongo.db?.collection<FavouriteSchema>(COLL_FAVOURITES);
  const res = await coll?.findOne({
    mediaId: request.query.movieId,
    userId: request.user.id,
    mediaType: MEDIA_TYPE.MOVIE,
    isRemoved: false,
  });
  return {success: true, isLikedByMe: !!res};
};

type GtMvFstReq = FastifyRequest<GetMovieDetailRequest>;
export const getMovieDetailHandler = async (request: GtMvFstReq, reply: FastifyReply) => {
  const {movieId} = request.query;
  const collMovie = request.mongo.db?.collection<MovieSchema>(COLL_MOVIES);
  const movieData = await collMovie?.findOne({_id: new ObjectId(movieId)});
  if (!movieData) {
    return reply.notFound('movie not found');
  }
  return {success: true, data: movieData};
};

type AdVwFstReq = FastifyRequest<AddViewRequest>;
export const addMovieViewHandler = async (request: AdVwFstReq, reply: FastifyReply) => {
  const collMovie = request.mongo.db?.collection<MovieSchema>(COLL_MOVIES);
  const coll = request.mongo.db?.collection<MovieViewSchema>(COLL_MOVIE_VIEWS);
  const {movieId} = request.body;
  const userId = request.user.id;
  const movieFilter: Filter<MovieSchema> = {_id: new ObjectId(movieId)};
  const viewFilter: Filter<MovieViewSchema> = {movieId, userId};
  const [movie, movieView] = await Promise.all([
    collMovie?.findOne(movieFilter),
    coll?.findOne(viewFilter),
  ]);
  if (!movie) {
    return reply.notFound('Movie not found');
  }
  const updatedTs = request.getCurrentTimestamp();
  let viewCount = movie.viewCount || 0;
  if (!movieView) {
    collMovie?.updateOne(movieFilter, {$inc: {viewCount: 1}, $set: {updatedTs}});
    viewCount += 1;
  }
  await coll?.findOneAndUpdate(viewFilter, {$set: {movieId, userId, updatedTs}}, {upsert: true});
  return {success: true, message: 'Updated successfully', viewCount};
};
