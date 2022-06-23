import {SwaggerOptions} from '@fastify/swagger';

export const RELATIVE_DIST_STATIC_FOLDER = '../public';
export const SWAGGER_CONFIG_OPTS: SwaggerOptions = {
  routePrefix: '/docs',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'Trailsbuddy API',
      description: 'Trailsbuddy API documentation',
      version: '0.0.1',
    },
  },
};
