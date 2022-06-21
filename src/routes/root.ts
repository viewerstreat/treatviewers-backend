import {FastifyPluginAsync} from 'fastify';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const user = fastify.mongo.db?.collection('users');
    const result = await user?.findOne({email: 'sibu.it13@gmail.com'});
    return {root: true, result};
  });

  fastify.get('/ping', async (request, reply) => {
    return {success: true, message: 'Server running successfully!'};
  });
};

export default root;
