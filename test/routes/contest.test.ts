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
    movieId: '',
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

  t.test('create contest without category', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload, category: null},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create contest movieId null', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload, movieId: null},
    });
    ct.equal(res.statusCode, 200);
  });

  t.test('create contest without bannerImageUrl', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload, bannerImageUrl: null},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create contest without videoUrl', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload, videoUrl: null},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create contest without sponsoredBy', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload, sponsoredBy: null},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create contest without entryFee', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload, entryFee: null},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create contest zero entryFee', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload, entryFee: 0},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create contest without startTime', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload, startTime: null},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create contest without endTime', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload, endTime: null},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create contest duplicate title', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...contestPayload},
    });
    ct.equal(res.statusCode, 500);
  });

  t.test('create contest', async (ct) => {
    const payload = {...contestPayload, title: `Test Contest ${new Date().getTime()}`};
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/contest',
      headers: {authorization: `Bearer ${token}`},
      payload: {...payload},
    });
    ct.equal(res.statusCode, 200);
    const result = JSON.parse(res.payload);
    ct.equal(result.success, true);
    ct.match(result.data, payload);
    const {_id} = result.data;
    ct.ok(_id);
    const res1 = await app.inject({
      url: '/api/v1/contest',
      query: {_id},
      headers: {authorization: `Bearer ${token}`},
    });
    ct.equal(res1.statusCode, 200);
    const result1 = JSON.parse(res1.payload);
    ct.equal(result1.success, true);
    ct.match(result1.data[0], payload);
  });
});
