import {test} from 'tap';
import Fastify from 'fastify';
import Support from '../../src/plugins/support';
import {DEFAULT_PAGE_SIZE, MOVIE_EXPIRY_DAYS} from '../../src/utils/config';

test('support decorator function', async (t) => {
  t.plan(5);
  const fastify = Fastify();
  void fastify.register(Support);
  await fastify.ready();

  t.equal(fastify.getDefaultPageSize(), DEFAULT_PAGE_SIZE);
  const currTs = fastify.getCurrentTimestamp();
  const defaultMoviePromoExpiry = fastify.getDefaultMoviePromoExpiry();
  t.ok(currTs > 0);
  t.ok(defaultMoviePromoExpiry > 0);
  t.ok(defaultMoviePromoExpiry > currTs);
  t.equal(
    Math.floor((defaultMoviePromoExpiry - currTs) / (24 * 60 * 60 * 1000)),
    MOVIE_EXPIRY_DAYS,
  );
});
