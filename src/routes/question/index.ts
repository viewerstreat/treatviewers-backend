import {FastifyPluginAsync} from 'fastify';
import {createQuestionHandler, getQuestionHandler} from './question.handler';
import {
  CreateQuestionRequest,
  CreateQuestionRequestOpts,
  GetQuestionRequest,
  GetQuestionRequestOpts,
} from './question.schema';

const contestRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // create contest
  fastify.post<CreateQuestionRequest>('/', CreateQuestionRequestOpts, createQuestionHandler);

  // get contest
  fastify.get<GetQuestionRequest>('/', GetQuestionRequestOpts, getQuestionHandler);
};

export default contestRoute;
