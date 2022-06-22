import {FastifyPluginAsync} from 'fastify';
import {userHandler} from '../controllers/user';

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  console.log(opts);
  fastify.get('/user', userHandler);
};

export default user;
