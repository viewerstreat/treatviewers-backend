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

// JWT token expiry time either in seconds or in string like 1d, 2h etc.
export const JWT_EXPIRY: string | number = '1h';

// Default Movie promotion expiry in days
export const MOVIE_EXPIRY_DAYS = 10;

// default page size when fetching a list
export const DEFAULT_PAGE_SIZE = 10;
