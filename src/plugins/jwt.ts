import fp from 'fastify-plugin';
import fastifyJWT from '@fastify/jwt';
import {FastifyReply, FastifyRequest} from 'fastify';
import {
  API_ROUTE_PREFIX,
  JWT_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  UNPROTECTED_ROUTES,
} from '../utils/config';

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

  fastify.decorate('generateRefreshToken', (id: number): string => {
    const token = fastify.jwt.sign({id}, {expiresIn: REFRESH_TOKEN_EXPIRY});
    return token;
  });

  fastify.decorate('validateRefreshToken', (refreshToken: string): number => {
    try {
      const payload = fastify.jwt.verify<{id: number}>(refreshToken);
      if (!payload || !payload.id) {
        throw new Error('not valid refresh token');
      }
      return payload.id;
    } catch (err) {
      fastify.log.error(err);
      return 0;
    }
  });

  fastify.decorate('getUserIdFromToken', (token: string): number => {
    try {
      const data = fastify.jwt.decode<{id: number}>(token);
      return data?.id || 0;
    } catch (err) {
      return 0;
    }
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
    request.generateRefreshToken = fastify.generateRefreshToken;
    request.validateRefreshToken = fastify.validateRefreshToken;
    request.getUserIdFromToken = fastify.getUserIdFromToken;
    done();
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyRequest {
    generateToken(id: number, name?: string): string;
    generateRefreshToken(id: number): string;
    validateRefreshToken(refreshToken: string): number;
    getUserIdFromToken(token: string): number;
  }
  export interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    generateToken(id: number, name?: string): string;
    generateRefreshToken(id: number): string;
    validateRefreshToken(refreshToken: string): number;
    getUserIdFromToken(token: string): number;
  }
}
