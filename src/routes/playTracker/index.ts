import {FastifyPluginAsync} from 'fastify';
import {answerHandler, finishHandler, playTrackerHandler} from './playTracker.handler';
import {
  PlayTrackerOpts,
  PlayTrackerInitReq,
  AnswerRequest,
  AnswerReqOpts,
  FinishRequest,
  FinishReqOpts,
} from './playTracker.schema';

const playTrackerRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // get playTracker
  fastify.get<PlayTrackerInitReq>('/', PlayTrackerOpts, playTrackerHandler);

  // post answer
  fastify.post<AnswerRequest>('/answer', AnswerReqOpts, answerHandler);

  // finish quiz
  fastify.post<FinishRequest>('/finish', FinishReqOpts, finishHandler);
};

export default playTrackerRoute;
