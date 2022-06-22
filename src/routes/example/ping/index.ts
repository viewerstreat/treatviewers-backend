import {FastifyPluginAsync} from 'fastify';

const ping: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async (request, reply) => {
    return {success: true, message: 'Ping inside example'};
  });
};

export default ping;
