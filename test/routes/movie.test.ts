import {test} from 'tap';
import {build} from '../helper';

test('movie routes', async (t) => {
  const app = await build(t);
  const tokenRes = await app.inject({
    url: '/api/v1/getToken',
  });
  const {token} = JSON.parse(tokenRes.payload);

  t.test('unauthenticated create movie', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/movie',
      payload: {},
    });
    ct.equal(res.statusCode, 401);
  });

  const name = `Test Movie ${new Date().getTime()}`;
  const description = 'Test Movie description';
  const tags = ['test tag 1', 'test tag 2'];
  const bannerImageUrl = 'https://somethingorwhatever.com/movie.png';
  const videoUrl = 'https://somethingorwhatever.com/movie.mp4';
  const sponsoredBy = 'sponsoredBy';
  const sponsoredByLogo = 'sponsoredByLogo';
  const releaseOutlets = ['outlet 1', 'outlet 2'];
  const releaseDate = new Date().getTime();
  const moviePromotionExpiry = new Date().getTime() + 24 * 60 * 60 * 1000;

  t.test('create movie without name', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/movie',
      headers: {authorization: `Bearer ${token}`},
      payload: {description, bannerImageUrl, videoUrl, sponsoredBy, releaseDate},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create movie without description', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/movie',
      headers: {authorization: `Bearer ${token}`},
      payload: {name, bannerImageUrl, videoUrl, sponsoredBy, releaseDate},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create movie without bannerImageUrl', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/movie',
      headers: {authorization: `Bearer ${token}`},
      payload: {name, description, videoUrl, sponsoredBy, releaseDate},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create movie without videoUrl', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/movie',
      headers: {authorization: `Bearer ${token}`},
      payload: {name, description, bannerImageUrl, sponsoredBy, releaseDate},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create movie without sponsoredBy', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/movie',
      headers: {authorization: `Bearer ${token}`},
      payload: {name, description, bannerImageUrl, videoUrl, releaseDate},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create movie without releaseDate', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/movie',
      headers: {authorization: `Bearer ${token}`},
      payload: {name, description, bannerImageUrl, videoUrl, sponsoredBy},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create movie', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/movie',
      headers: {authorization: `Bearer ${token}`},
      payload: {
        name,
        description,
        tags,
        bannerImageUrl,
        videoUrl,
        sponsoredBy,
        sponsoredByLogo,
        releaseOutlets,
        releaseDate,
        moviePromotionExpiry,
      },
    });
    const result = JSON.parse(res.payload);
    ct.equal(res.statusCode, 200);
    ct.equal(result.success, true);
    ct.equal(result.data.name, name);
    ct.equal(result.data.description, description);
    ct.same(result.data.tags, tags);
    ct.equal(result.data.bannerImageUrl, bannerImageUrl);
    ct.equal(result.data.videoUrl, videoUrl);
    ct.equal(result.data.sponsoredBy, sponsoredBy);
    ct.equal(result.data.sponsoredByLogo, sponsoredByLogo);
    ct.same(result.data.releaseOutlets, releaseOutlets);
    ct.equal(result.data.releaseDate, releaseDate);
    ct.equal(result.data.moviePromotionExpiry, moviePromotionExpiry);
    ct.equal(result.data.viewCount, 0);
    ct.equal(result.data.likeCount, 0);
    ct.equal(result.data.isActive, true);
    ct.ok(result.data._id);
    const {_id} = result.data._id;
    if (_id) {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/movie',
        headers: {authorization: `Bearer ${token}`},
        query: {_id},
      });
      const result = JSON.parse(res.payload);
      ct.equal(res.statusCode, 200);
      ct.equal(result.success, true);
      ct.ok(Array.isArray(result.data));
      ct.equal(result.data.length, 1);
      ct.equal(result.data[0]._id, _id);
      ct.ok(result.data[0].name);
      ct.ok(result.data[0].description);
      ct.ok(result.data[0].bannerImageUrl);
      ct.ok(result.data[0].videoUrl);
      ct.ok(result.data[0].sponsoredBy);
      ct.ok(result.data[0].releaseDate);
    }
  });

  t.test('unauthenticated Get movie', async (ct) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/movie',
    });
    ct.equal(res.statusCode, 401);
  });

  t.test('Get Movie', async (ct) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/movie',
      headers: {authorization: `Bearer ${token}`},
      query: {},
    });
    const result = JSON.parse(res.payload);
    ct.equal(res.statusCode, 200);
    ct.equal(result.success, true);
    ct.ok(Array.isArray(result.data));
  });
});
