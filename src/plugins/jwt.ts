import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import {FastifyReply, FastifyRequest} from 'fastify';
import {JWT_EXPIRY} from '../utils/config';

export default fp(async (fastify, opts) => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error('JWT_SECRET_KEY not found.');
  }
  fastify.register(fastifyJwt, {secret});

  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    },
  );

  fastify.decorate('generateToken', (id: number): string => {
    const payload = {id};
    const token = fastify.jwt.sign(payload, {expiresIn: JWT_EXPIRY});
    return token;
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    generateToken(id: number): string;
  }
}
