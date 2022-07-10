import {FastifyPluginAsync} from 'fastify';
import {playTrackerHandler} from './playTracker.handler';
import {PlayTrackerOpts, PlayTrackerInitReq} from './playTracker.schema';

const playTrackerRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // get playTracker
  fastify.get<PlayTrackerInitReq>('/', PlayTrackerOpts, playTrackerHandler);
};

export default playTrackerRoute;
