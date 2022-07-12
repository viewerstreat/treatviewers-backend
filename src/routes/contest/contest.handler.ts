import {ObjectId} from '@fastify/mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {Filter, Sort} from 'mongodb';
import {ContestSchema, CONTEST_CATEGORY, PRIZE_SELECTION} from '../../models/contest';
import {MovieSchema} from '../../models/movie';
import {COLL_CONTESTS, COLL_MOVIES} from '../../utils/constants';
import {CreateContestRequest, GetContestRequest} from './contest.schema';

type CrtCntstFstReq = FastifyRequest<CreateContestRequest>;
export const createContestHandler = async (request: CrtCntstFstReq, reply: FastifyReply) => {
  const collection = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  // movieId must be valid when category is movie
  const {category, movieId} = request.body;
  if (category === CONTEST_CATEGORY.MOVIE) {
    if (!movieId) {
      reply.status(400).send({success: false, message: 'movieId is required'});
      return;
    }
    const collMovie = request.mongo.db?.collection<MovieSchema>(COLL_MOVIES);
    const movie = await collMovie?.findOne({_id: new ObjectId(movieId)});
    if (!movie) {
      reply.status(400).send({success: false, message: 'movieId must be valid'});
      return;
    }
  }
  const {
    prizeSelection,
    topWinnersCount,
    prizeRatioNumerator,
    prizeRatioDenominator,
    topPrizeValue,
  } = request.body;
  // validate prizeSelection
  if (prizeSelection === PRIZE_SELECTION.TOP_WINNERS && !topWinnersCount) {
    reply.status(400).send({success: false, message: 'topWinnersCount is required'});
    return;
  }
  if (
    prizeSelection === PRIZE_SELECTION.RATIO_BASED &&
    (!prizeRatioNumerator || !prizeRatioDenominator || prizeRatioNumerator < prizeRatioDenominator)
  ) {
    reply
      .status(400)
      .send({success: false, message: 'prizeRatioNumerator & prizeRatioDenominator invalid'});
    return;
  }

  const doc: ContestSchema = {
    title: request.body.title,
    category,
    movieId,
    sponsoredBy: request.body.sponsoredBy,
    sponsoredByLogo: request.body.sponsoredByLogo,
    bannerImageUrl: request.body.bannerImageUrl,
    videoUrl: request.body.videoUrl,
    entryFee: request.body.entryFee,
    topPrizeValue,
    prizeSelection,
    topWinnersCount,
    prizeRatioNumerator,
    prizeRatioDenominator,
    startTime: request.body.startTime,
    endTime: request.body.endTime,
    questionCount: 0,
    viewCount: 0,
    likeCount: 0,
    isActive: true,
    createdBy: request.user.id,
    createdTs: request.getCurrentTimestamp(),
  };
  const result = await collection?.insertOne(doc);
  const data: ContestSchema = {
    _id: result?.insertedId,
    ...doc,
  };
  return {success: true, data};
};

export const getContestHandler = async (
  request: FastifyRequest<GetContestRequest>,
  reply: FastifyReply,
) => {
  // generate the findBy query
  const findBy: Filter<ContestSchema> = {isActive: true};
  // filter by _id if it is passed in the query parameters
  if (request.query._id) {
    findBy._id = new ObjectId(request.query._id);
  }
  // filter by movieId is it is passed in the query parameters
  if (request.query.movieId) {
    findBy.movieId = request.query.movieId;
  }
  const sortBy: Sort = {_id: -1};
  const pageNo = request.query.pageIndex || 0;
  const pageSize = request.query.pageSize || request.getDefaultPageSize();
  const result = await request.mongo.db
    ?.collection<ContestSchema>(COLL_CONTESTS)
    .find(findBy)
    .skip(pageNo * pageSize)
    .limit(pageSize)
    .sort(sortBy)
    .toArray();
  return {success: true, data: result};
};
