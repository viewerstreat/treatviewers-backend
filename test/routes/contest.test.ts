import {test} from 'tap';
import {build} from '../helper';

test('contest routes', async (t) => {
  const app = await build(t);
  const tokenRes = await app.inject({
    url: '/api/v1/getToken',
  });
  const {token} = JSON.parse(tokenRes.payload);

  t.test('unauthenticated create contest', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      payload: {},
    });
    ct.equal(res.statusCode, 401);
  });

  const contestPayload = {
    title: `Test Contest ${new Date().getTime()}`,
    category: 'others',
    movieId: null,
    bannerImageUrl: 'https://somethingorwhatever.com/movie.png',
    videoUrl: 'https://somethingorwhatever.com/movie.mp4',
    sponsoredBy: 'sponsoredBy',
    sponsoredByLogo: 'sponsoredByLogo',
    entryFee: 10,
    topPrize: 'topPrize',
    prizeRatio: 'prizeRatio',
    topWinners: 'topWinners',
    startTime: 1665996305577,
    endTime: 1666996305577,
  };

  t.test('create contest without title', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload, title: null},
    });
    ct.equal(res.statusCode, 400);
  });
});
