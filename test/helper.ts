// This file contains code that we reuse between our tests.
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import App from '../src/app';
import * as tap from 'tap';
import {loadEnv} from '../src/utils/loadEnv';
export type Test = typeof tap['Test']['prototype'];

// Fill in this config with all the configurations
// needed for testing the application
// async function config () {
//   return {}
// }

function setupEnv() {
  process.env.NODE_ENV = 'test';
  loadEnv();
}

// Automatically build and tear down our instance
async function build(t: Test) {
  setupEnv();
  const app = Fastify();

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  void app.register(fp(App));

  await app.ready();

  // Tear down our app after we are done
  t.teardown(() => void app.close());

  return app;
}

export {build, setupEnv};
