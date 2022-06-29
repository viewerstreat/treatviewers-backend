import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {Filter, Sort} from 'mongodb';
import {MovieSchema} from '../../models/movie';
import {COLL_MOVIES} from '../../utils/constants';
import {CreateMovieRequest, GetMoviesRequest} from './movie.schema';

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
