import {ObjectId} from '@fastify/mongodb';
import {FastifyReply, FastifyRequest} from 'fastify';
import {Filter, Sort} from 'mongodb';
import {ContestSchema} from '../../models/contest';
import {QuestionSchema} from '../../models/question';
import {COLL_CONTESTS, COLL_QUESTIONS} from '../../utils/constants';
import {CreateQuestionRequest, GetNxtQuesReq, GetQuestionRequest} from './question.schema';

type CrtQsFstReq = FastifyRequest<CreateQuestionRequest>;
export const createQuestionHandler = async (request: CrtQsFstReq, reply: FastifyReply) => {
  // options must have one correct answer
  if (request.body.options.filter((el) => el.isCorrect).length !== 1) {
    reply.status(400).send({success: false, message: `Options must have one correct answer`});
    return;
  }

  // options should not have duplicate optionId
  {
    const optionIds = request.body.options.map((el) => el.optionId);
    const duplicates = optionIds.filter((el, idx) => optionIds.indexOf(el) !== idx);
    if (duplicates.length > 0) {
      reply.status(400).send({success: false, message: `Duplicate optionId`});
      return;
    }
  }

  const {contestId} = request.body;
  // first validate whether valid contestId
  const collContest = request.mongo.db?.collection<ContestSchema>(COLL_CONTESTS);
  const collQues = request.mongo.db?.collection<QuestionSchema>(COLL_QUESTIONS);
  const findBy = {_id: new ObjectId(contestId), isActive: true};
  const constest = await collContest?.findOne(findBy);
  if (!constest) {
    reply
      .status(400)
      .send({success: false, message: `Not a valid contestId: ${request.body.contestId}`});
    return;
  }
  const doc: QuestionSchema = {
    contestId,
    questionNo: request.body.questionNo,
    questionText: request.body.questionText,
    options: request.body.options,
    isActive: true,
    createdBy: request.user.id,
    createdTs: request.getCurrentTimestamp(),
  };
  await collQues?.insertOne(doc);

  // increase the question count in contest
  await collContest?.updateOne(findBy, {$inc: {questionCount: 1}});
  // return success response
  return {success: true, message: 'Inserted successfully'};
};

type GetQsFstReq = FastifyRequest<GetQuestionRequest>;
export const getQuestionHandler = async (request: GetQsFstReq, reply: FastifyReply) => {
  // generate the findBy query
  const findBy: Filter<QuestionSchema> = {
    contestId: request.query.contestId,
    questionNo: Number(request.query.questionNo),
  };
  const collQues = request.mongo.db?.collection<QuestionSchema>(COLL_QUESTIONS);
  const result = await collQues?.findOne(findBy);
  if (!result) {
    reply.status(404).send({
      success: false,
      message: `Question not found with contestId: ${request.query.contestId}, questionNo: ${request.query.questionNo}`,
    });
    return;
  }
  return {success: true, data: result};
};

type GetNxtQFstReq = FastifyRequest<GetNxtQuesReq>;
export const getNxtQuesHandler = async (request: GetNxtQFstReq, reply: FastifyReply) => {
  // generate the findBy query
  const findBy: Filter<QuestionSchema> = {
    contestId: request.query.contestId,
    questionNo: {$gt: Number(request.query.currQuesNo)},
    isActive: true,
  };
  const sortBy: Sort = {questionNo: 1};
  const collQues = request.mongo.db?.collection<QuestionSchema>(COLL_QUESTIONS);
  const result = await collQues?.find(findBy).sort(sortBy).limit(1).toArray();
  if (!result || result.length === 0) {
    reply.status(404).send({
      success: false,
      message: 'No question found',
    });
    return;
  }
  return {success: true, data: result[0]};
};
