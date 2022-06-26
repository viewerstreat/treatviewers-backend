import * as dotenv from 'dotenv';
import fp from 'fastify-plugin';
import fastifyJWT from '@fastify/jwt';
import {FastifyReply, FastifyRequest} from 'fastify';
import {JWT_EXPIRY} from '../utils/config';

dotenv.config();

export interface JWTPayload {
  id: number;
  name?: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}

export default fp(async (fastify, opts) => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error('JWT_SECRET_KEY not found.');
  }

  fastify.register(fastifyJWT, {secret});
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        console.log('authenticate called');
        await request.jwtVerify();
      } catch (err) {
        console.log(err);
        reply.send(err);
      }
    },
  );

  fastify.decorate('generateToken', (id: number, name?: string): string => {
    const token = fastify.jwt.sign({id, name}, {expiresIn: JWT_EXPIRY});
    return token;
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    generateToken(id: number, name?: string): string;
  }
}
