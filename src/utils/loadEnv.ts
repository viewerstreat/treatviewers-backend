import * as dotenv from 'dotenv';

// load the env file depending on the NODE_ENV
function loadEnv() {
  const path = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
  dotenv.config({path});
}

export {loadEnv};
