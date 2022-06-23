import {FastifyPluginAsync} from 'fastify';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/ping', async (request, reply) => {
    return {success: true, message: 'Server running successfully!'};
  });
};

export default root;
