import {SwaggerOptions} from '@fastify/swagger';

export const RELATIVE_DIST_STATIC_FOLDER = '../public';
export const SWAGGER_CONFIG_OPTS: SwaggerOptions = {
  routePrefix: '/docs',
  exposeRoute: true,
  staticCSP: true,
  swagger: {
    info: {
      title: 'Trailsbuddy API',
      description: 'Trailsbuddy API documentation',
      version: '0.0.1',
    },
    schemes: ['https', 'http'],
  },
};

// route prefix for APIs
export const API_ROUTE_PREFIX = '/api/v1';

// JWT token expiry time either in seconds or in string like 1d, 2h etc.
export const JWT_EXPIRY: string | number = '1d';

// Default Movie promotion expiry in days
export const MOVIE_EXPIRY_DAYS = 10;

// default page size when fetching a list
export const DEFAULT_PAGE_SIZE = 10;

// otp length
export const OTP_LENGTH = 6;

// otp validity in minutes
export const OTP_VALIDITY_MINS = 5;

// AWS S3 Region
export const AWS_REGION = 'ap-south-1';

// AWS S3 bucket name
export const AWS_BUCKET = 'trailsbuddy-1';

interface RouteName {
  method: 'GET' | 'POST';
  url: string;
}

// unprotected routes
// application allow calls without the authorization header
export const UNPROTECTED_ROUTES: RouteName[] = [
  {method: 'POST', url: '/api/v1/user/create'},
  {method: 'GET', url: '/api/v1/user/verify'},
  {method: 'GET', url: '/api/v1/user/checkOtp'},
  {method: 'GET', url: '/api/v1/clip'},
  {method: 'GET', url: '/api/v1/contest'},
  {method: 'GET', url: '/api/v1/movie'},
  {method: 'GET', url: '/api/v1/movie/details'},
  {method: 'GET', url: '/api/v1/ping'},
  {method: 'GET', url: '/api/v1/tempApiGetToken'},
  {method: 'GET', url: '/api/v1/tempApiGetOtp'},
];
