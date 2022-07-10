import {FastifyPluginAsync} from 'fastify';

const playTrackerRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // initialize playTracker
  // fastify.post<PlayTrackerInitReq>('/init', PlayTrackerInitOpts, initHandler);
};

export default playTrackerRoute;
