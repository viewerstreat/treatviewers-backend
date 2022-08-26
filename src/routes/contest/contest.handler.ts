import {ObjectId} from '@fastify/mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {Filter, Sort} from 'mongodb';
import {
  ContestSchema,
  CONTEST_CATEGORY,
  CONTEST_STATUS,
  PRIZE_SELECTION,
} from '../../models/contest';
import {MovieSchema} from '../../models/movie';
import {COLL_CONTESTS, COLL_MOVIES} from '../../utils/constants';
import {ActivateRequest, CreateContestRequest, GetContestRequest} from './contest.schema';

type CrtCntstFstReq = FastifyRequest<CreateContestRequest>;
export const createContestHandler = async (request: CrtCntstFstReq, reply: FastifyReply) => {
  const collection = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  // movieId must be valid when category is movie
  const {category, movieId} = request.body;
  if (category === CONTEST_CATEGORY.MOVIE) {
    if (!movieId) {
      return reply.badRequest('movieId is required');
    }
    const collMovie = request.mongo.db?.collection<MovieSchema>(COLL_MOVIES);
    const movie = await collMovie?.findOne({_id: new ObjectId(movieId), isActive: true});
    if (!movie) {
      return reply.badRequest('movieId must be valid');
    }
  }
  const {
    prizeSelection,
    topWinnersCount,
    prizeRatioNumerator,
    prizeRatioDenominator,
    prizeValue,
    startTime,
    endTime,
  } = request.body;
  // validate prizeSelection
  if (prizeSelection === PRIZE_SELECTION.TOP_WINNERS && !topWinnersCount) {
    return reply.badRequest('topWinnersCount is required');
  }
  if (
    prizeSelection === PRIZE_SELECTION.RATIO_BASED &&
    (!prizeRatioNumerator || !prizeRatioDenominator || prizeRatioNumerator > prizeRatioDenominator)
  ) {
    return reply.badRequest('prizeRatioNumerator & prizeRatioDenominator invalid');
  }
  if (endTime <= startTime) {
    reply.status(400).send({success: false, message: 'startTime and endTime are invalid'});
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
    prizeValue,
    prizeSelection,
    topWinnersCount,
    prizeRatioNumerator,
    prizeRatioDenominator,
    startTime,
    endTime,
    questionCount: 0,
    viewCount: 0,
    likeCount: 0,
    status: CONTEST_STATUS.CREATED,
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

type GetContFstReq = FastifyRequest<GetContestRequest>;
export const getContestHandler = async (request: GetContFstReq, reply: FastifyReply) => {
  // generate the findBy query
  const findBy: Filter<ContestSchema> = {};
  // filter by _id if it is passed in the query parameters
  if (request.query._id) {
    findBy._id = new ObjectId(request.query._id);
  }
  // filter by movieId is it is passed in the query parameters
  if (request.query.movieId) {
    findBy.movieId = request.query.movieId;
    findBy.status = CONTEST_STATUS.ACTIVE;
  }
  // filter by category
  if (request.query.category) {
    findBy.category = request.query.category;
    findBy.status = CONTEST_STATUS.ACTIVE;
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

// handler function to update contest status active
type ActCntstFstReq = FastifyRequest<ActivateRequest>;
export const activateHandler = async (request: ActCntstFstReq, reply: FastifyReply) => {
  const filter: Filter<ContestSchema> = {
    _id: new ObjectId(request.body.contestId),
    status: {$in: [CONTEST_STATUS.CREATED, CONTEST_STATUS.INACTIVE]},
    endTime: {$gt: request.getCurrentTimestamp()},
    questionCount: {$gt: 0},
  };
  const coll = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const result = await coll?.updateOne(filter, {
    $set: {
      status: CONTEST_STATUS.ACTIVE,
      updatedBy: request.user.id,
      updatedTs: request.getCurrentTimestamp(),
    },
  });
  if (!result?.matchedCount) {
    return reply.notFound('contest do not exists or do not match criteria');
  }
  return {success: true, message: 'Updated successfully'};
};

export const inActivateHandler = async (request: ActCntstFstReq, reply: FastifyReply) => {
  const filter: Filter<ContestSchema> = {
    _id: new ObjectId(request.body.contestId),
    status: {$in: [CONTEST_STATUS.CREATED, CONTEST_STATUS.ACTIVE]},
    startTime: {$gt: request.getCurrentTimestamp()},
  };
  const coll = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const result = await coll?.updateOne(filter, {
    $set: {
      status: CONTEST_STATUS.INACTIVE,
      updatedBy: request.user.id,
      updatedTs: request.getCurrentTimestamp(),
    },
  });
  if (!result?.matchedCount) {
    return reply.notFound('contest not found or criteria not met');
  }
  return {success: true, message: 'Updated successfully'};
};

export const contestWiseResultHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const coll = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const userId = request.user.id;
  const result = await coll
    ?.find({
      status: CONTEST_STATUS.ENDED,
      'allPlayTrackers.userId': userId,
    })
    .sort({updatedTs: -1})
    .limit(10)
    .toArray();

  const data = result?.map((el) => {
    const pt = el.allPlayTrackers?.find((e) => e.userId === userId);
    const winner = el.winners?.find((e) => e.userId === userId);
    const obj = {
      _id: el._id,
      title: el.title,
      rank: pt?.rank,
      timeTaken: pt?.timeTaken,
      correctAns: pt?.score,
      totalQues: pt?.totalQuestions,
      earning: el.prizeValue,
      badgesWon: !!winner,
    };
    return obj;
  });
  return {success: true, data};
};
