import {FastifyPluginAsync} from 'fastify';
import {createQuestionHandler, getQuestionHandler} from './question.handler';
import {
  CreateQuestionRequest,
  CreateQuestionRequestOpts,
  GetQuestionRequest,
  GetQuestionRequestOpts,
} from './question.schema';

const quesRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // create question
  fastify.post<CreateQuestionRequest>('/', CreateQuestionRequestOpts, createQuestionHandler);

  // get question
  fastify.get<GetQuestionRequest>('/', GetQuestionRequestOpts, getQuestionHandler);

  // // get next question for a contest
  // fastify.get<GetNxtQuesReq>('/getNext', GetNxtQuesReqOpts, getNxtQuesHandler);
};

export default quesRoute;
