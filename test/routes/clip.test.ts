import {test} from 'tap';
import {build} from '../helper';

test('clip routes', async (t) => {
  const app = await build(t);
  const tokenRes = await app.inject({
    url: '/api/v1/getToken',
  });
  const {token} = JSON.parse(tokenRes.payload);
  t.test('unauthenticated create clip', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/clip',
      payload: {},
    });
    ct.equal(res.statusCode, 401);
  });

  const name = `Test Movie ${new Date().getTime()}`;
  const description = 'Test Clip description';
  const bannerImageUrl = 'https://bannerImageUrl.com/bannerImageUrl';
  const videoUrl = 'https://videoUrl.com/videoUrl';

  t.test('create clip without name', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/clip',
      headers: {authorization: `Bearer ${token}`},
      payload: {},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create clip without description', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/clip',
      headers: {authorization: `Bearer ${token}`},
      payload: {name},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create clip without bannerImageUrl', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/clip',
      headers: {authorization: `Bearer ${token}`},
      payload: {name, description},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create clip without videoUrl', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/clip',
      headers: {authorization: `Bearer ${token}`},
      payload: {name, description, bannerImageUrl},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create clip', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/clip',
      headers: {authorization: `Bearer ${token}`},
      payload: {name, description, bannerImageUrl, videoUrl},
    });
    ct.equal(res.statusCode, 200);
    const result = JSON.parse(res.payload);
    ct.equal(result.success, true);
    ct.equal(result.data.name, name);
    ct.equal(result.data.description, description);
    ct.equal(result.data.bannerImageUrl, bannerImageUrl);
    ct.equal(result.data.videoUrl, videoUrl);
    ct.equal(result.data.viewCount, 0);
    ct.equal(result.data.likeCount, 0);
    ct.equal(result.data.isActive, true);
    ct.ok(result.data._id);
  });

  t.test('clip name unique', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/clip',
      headers: {authorization: `Bearer ${token}`},
      payload: {name, description, bannerImageUrl, videoUrl},
    });
    ct.equal(res.statusCode, 500);
  });
});
