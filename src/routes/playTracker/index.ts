import {FastifyPluginAsync} from 'fastify';
import {getNxtQuesHandler} from '../question/question.handler';
import {GetNxtQuesReq, GetNxtQuesReqOpts} from '../question/question.schema';
import {
  answerHandler,
  finishHandler,
  playTrackerHandler,
  startPlayHandler,
} from './playTracker.handler';
import {
  PlayTrackerOpts,
  AnswerRequest,
  AnswerReqOpts,
  FinishRequest,
  FinishReqOpts,
  PlayTrackerGetReq,
  PlayStartReq,
  PlayStartReqOpts,
} from './playTracker.schema';

const playTrackerRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // get playTracker
  fastify.get<PlayTrackerGetReq>('/', PlayTrackerOpts, playTrackerHandler);
  // start Play
  fastify.post<PlayStartReq>('/start', PlayStartReqOpts, startPlayHandler);
  // get next question
  fastify.get<GetNxtQuesReq>('/getNextQues', GetNxtQuesReqOpts, getNxtQuesHandler);
  // post answer
  fastify.post<AnswerRequest>('/answer', AnswerReqOpts, answerHandler);
  // finish quiz
  fastify.post<FinishRequest>('/finish', FinishReqOpts, finishHandler);
};

export default playTrackerRoute;
