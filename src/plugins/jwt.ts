import fp from 'fastify-plugin';
import fastifyJWT from '@fastify/jwt';
import {FastifyReply, FastifyRequest} from 'fastify';
import {API_ROUTE_PREFIX, JWT_EXPIRY, UNPROTECTED_ROUTES} from '../utils/config';

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
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    },
  );

  fastify.decorate('generateToken', (id: number, name?: string): string => {
    const token = fastify.jwt.sign({id, name}, {expiresIn: JWT_EXPIRY});
    return token;
  });

  // onRequest hook
  fastify.addHook('onRequest', async (request, reply) => {
    const {routerPath, method} = request;
    const url = routerPath.endsWith('/') ? routerPath.slice(0, -1) : routerPath;
    if (url.startsWith(API_ROUTE_PREFIX)) {
      const route = UNPROTECTED_ROUTES.find((e) => e.method === method && e.url === url);
      if (!route) {
        await fastify.authenticate(request, reply);
      }
    }
  });

  fastify.addHook('preHandler', (request, reply, done) => {
    request.generateToken = fastify.generateToken;
    done();
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyRequest {
    generateToken(id: number, name?: string): string;
  }
  export interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    generateToken(id: number, name?: string): string;
  }
}
