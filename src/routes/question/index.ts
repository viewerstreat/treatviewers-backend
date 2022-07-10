import {FastifyPluginAsync} from 'fastify';
import {createQuestionHandler, getNxtQuesHandler, getQuestionHandler} from './question.handler';
import {
  CreateQuestionRequest,
  CreateQuestionRequestOpts,
  GetNxtQuesReq,
  GetNxtQuesReqOpts,
  GetQuestionRequest,
  GetQuestionRequestOpts,
} from './question.schema';

const quesRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // create contest
  fastify.post<CreateQuestionRequest>('/', CreateQuestionRequestOpts, createQuestionHandler);

  // get contest
  fastify.get<GetQuestionRequest>('/', GetQuestionRequestOpts, getQuestionHandler);

  // get next question for a contest
  fastify.get<GetNxtQuesReq>('/getNext', GetNxtQuesReqOpts, getNxtQuesHandler);
};

export default quesRoute;
