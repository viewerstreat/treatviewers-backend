import {FastifyPluginAsync} from 'fastify';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/ping', async (request, reply) => {
    return {success: true, message: 'Server running successfully!'};
  });

  fastify.get('/getToken', async (request, reply) => {
    const token = fastify.generateToken(1);
    return {success: true, token};
  });
};

export default root;
