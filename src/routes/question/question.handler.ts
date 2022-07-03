import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {Filter} from 'mongodb';
import {ContestSchema} from '../../models/contest';
import {QuestionSchema} from '../../models/question';
import {COLL_CONTESTS, COLL_QUESTIONS} from '../../utils/constants';
import {CreateQuestionRequest, GetQuestionRequest} from './question.schema';

export const createQuestionHandler = async (
  request: FastifyRequest<CreateQuestionRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  // options must have one correct answer
  if (request.body.options.filter((el) => el.isCorrect).length !== 1) {
    reply.status(400).send({success: false, message: `Options must have one correct answer`});
    return;
  }

  {
    const optionIds = request.body.options.map((el) => el.optionId);
    const duplicates = optionIds.filter((el, idx) => optionIds.indexOf(el) !== idx);
    if (duplicates.length > 0) {
      reply.status(400).send({success: false, message: `Duplicate optionId`});
      return;
    }
  }

  // first validate whether valid contestId
  const findBy = {_id: new fastify.mongo.ObjectId(request.body.contestId)};
  const rs = await fastify.mongo.db?.collection<ContestSchema>(COLL_CONTESTS).findOne(findBy);
  if (!rs) {
    reply
      .status(400)
      .send({success: false, message: `Not a valid contestId: ${request.body.contestId}`});
    return;
  }
  const collection = fastify.mongo.db?.collection<QuestionSchema>(COLL_QUESTIONS);
  const doc: QuestionSchema = {
    contestId: request.body.contestId,
    questionNo: request.body.questionNo,
    questionText: request.body.questionText,
    options: request.body.options,
    isActive: true,
    createdBy: request.user.id,
    createdTs: fastify.getCurrentTimestamp(),
  };
  const result = await collection?.insertOne(doc);
  const data: QuestionSchema = {
    _id: result?.insertedId,
    ...doc,
  };

  return {success: true, data};
};

export const getQuestionHandler = async (
  request: FastifyRequest<GetQuestionRequest>,
  reply: FastifyReply,
  fastify: FastifyInstance,
) => {
  // generate the findBy query
  const findBy: Filter<QuestionSchema> = {
    isActive: true,
    contestId: request.query.contestId,
    questionNo: Number(request.query.questionNo),
  };
  const result = await fastify.mongo.db?.collection<QuestionSchema>(COLL_QUESTIONS).findOne(findBy);
  if (!result) {
    reply.status(404).send({
      success: false,
      message: `Question not found with contestId: ${request.query.contestId}, questionNo: ${request.query.questionNo}`,
    });
    return;
  }
  return {success: true, data: result};
};
