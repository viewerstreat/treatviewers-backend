import {FastifyReply, FastifyRequest} from 'fastify';

const userHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  reply.badGateway('bad gateway error from userHandler');
  //   throw new Error('error from userHandler');
  //   return {userHandler: true};
};

export {userHandler};
