import {SwaggerOptions} from '@fastify/swagger';
import {TransactionOptions, ReadPreference} from 'mongodb';

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

// transaction options for mongo transaction
export const TRANSACTION_OPTS: TransactionOptions = {
  readPreference: ReadPreference.primary,
  readConcern: {level: 'local'},
  writeConcern: {w: 'majority'},
};

// route prefix for APIs
export const API_ROUTE_PREFIX = '/api/v1';

// JWT token expiry time short lived.
export const JWT_EXPIRY: string | number = '1h';

// JWT Refresh token expiry long lived
export const REFRESH_TOKEN_EXPIRY: string | number = '10d';

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

// Task Id for scheduler task to finish contest
export const CONTEST_TASK_ID = 'SCHEDULER_TASK_CONTEST';

// Task Id for scheduler task to cleanup used otp & tokens
export const CLEANUP_TASK_ID = 'SCHEDULER_TASK_CLEANUP';

// Task Id for scheduler task to send out notifications
export const NOTI_TASK_ID = 'SCHEDULER_TASK_NOTI';

// Batch processing fetch limit
export const BATCH_FETCH_LIMIT = 10;

// scheduler job interval in second
export const SCHEDULER_INTERVAL = 300;

// cleanup jon interval in hours
export const CLEANUP_INTERVAL = 24;

// notification job interval in second
export const NOTI_INTERVAL = 120;

// token cleanup duration in days
export const TOKEN_CLEANUP_DRURATION = 10;

// minimum amount for balance withdrawal
export const WITHDRAW_BAL_MIN_AMOUNT = 10;

// FCM endpoint for sending push messages
export const FCM_ENDPOINT =
  'https://fcm.googleapis.com/v1/projects/trailsbuddy-1-3fbd5/messages:send';

// PUSH noitification icon colour
export const PUSH_ICON_COLOR = '#EA3333';

// Push message logo path
export const PUSH_MSG_LOGO_PATH =
  'https://trailsbuddy-1.s3.ap-south-1.amazonaws.com/1657115801399-441.jpeg';

interface RouteName {
  method: 'GET' | 'POST';
  url: string;
}

// unprotected routes
// application allow calls without the authorization header
export const UNPROTECTED_ROUTES: RouteName[] = [
  {method: 'POST', url: '/api/v1/user/renewToken'},
  {method: 'POST', url: '/api/v1/user/login'},
  {method: 'POST', url: '/api/v1/user/create'},
  {method: 'GET', url: '/api/v1/user/verify'},
  {method: 'GET', url: '/api/v1/user/checkOtp'},
  {method: 'GET', url: '/api/v1/user/getLeaderboard'},
  {method: 'GET', url: '/api/v1/clip'},
  {method: 'GET', url: '/api/v1/contest'},
  {method: 'GET', url: '/api/v1/movie'},
  {method: 'GET', url: '/api/v1/movie/details'},
  {method: 'GET', url: '/api/v1/ping'},
  {method: 'GET', url: '/api/v1/tempApiGetToken'},
  {method: 'GET', url: '/api/v1/tempApiGetOtp'},
];
