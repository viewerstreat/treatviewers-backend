import * as dotenv from 'dotenv';
import {join} from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import FastifyMongodb from '@fastify/mongodb';
import FastifyHelmet from '@fastify/helmet';
import FastifyCors from '@fastify/cors';
import FastifyStatic from '@fastify/static';
import FastifySwagger from '@fastify/swagger';
import {FastifyPluginAsync} from 'fastify';
import {RELATIVE_DIST_STATIC_FOLDER, SWAGGER_CONFIG_OPTS} from './utils/config';

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
    root: join(__dirname, RELATIVE_DIST_STATIC_FOLDER),
  });
  // register swagger plugin
  fastify.register(FastifySwagger, SWAGGER_CONFIG_OPTS);
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
