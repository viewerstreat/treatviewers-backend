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
  fastify.post<CreateQuestionRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...CreateQuestionRequestOpts},
    (request, reply) => createQuestionHandler(request, reply, fastify),
  );

  // get contest
  fastify.get<GetQuestionRequest>(
    '/',
    {onRequest: [fastify.authenticate], ...GetQuestionRequestOpts},
    (request, reply) => getQuestionHandler(request, reply, fastify),
  );
};

export default contestRoute;
