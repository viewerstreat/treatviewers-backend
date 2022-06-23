import * as dotenv from 'dotenv';
import {join} from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import FastifyMongodb from '@fastify/mongodb';
import FastifyHelmet from '@fastify/helmet';
import FastifyCors from '@fastify/cors';
import FastifyStatic from '@fastify/static';
import FastifySwagger from '@fastify/swagger';
import {FastifyPluginAsync} from 'fastify';

dotenv.config();
export type AppOptions = {
  isAwesomeApp: boolean;
} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  // register helmet
  fastify.register(FastifyHelmet);
  // register cors
  fastify.register(FastifyCors);
  // register mongodb plugins
  fastify.register(FastifyMongodb, {
    forceClose: true,
    url: process.env.DB_CONN_URL,
  });
  // register static file serve
  fastify.register(FastifyStatic, {
    root: join(__dirname, '../public'),
    prefix: '/public/',
    redirect: true,
  });

  // register swagger plugin
  fastify.register(FastifySwagger, {
    routePrefix: '/docs',
    swagger: {
      info: {
        title: 'Trailsbuddy API ',
        description: 'Trailsbuddy API documentation',
        version: '0.0.1',
      },
    },
    exposeRoute: true,
  });

  // fastify.setNotFoundHandler((request, reply) => {
  //   // const p = join(__dirname, '../public/index.html');
  //   reply.sendFile('app.js');
  // });

  // This loads all plugins defined in plugins
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  // This loads all plugins defined in routes
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: {...opts, prefix: '/api/v1'},
  });
};

export default app;
export {app};
