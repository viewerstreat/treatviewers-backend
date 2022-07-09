import {test} from 'tap';
import {build} from '../helper';

test('user route', async (t) => {
  const app = await build(t);
  const tokenRes = await app.inject({
    url: '/api/v1/tempApiGetToken',
    query: {userId: '1', name: 'test'},
  });
  const {token} = JSON.parse(tokenRes.payload);

  t.test('get user', async (ct) => {
    const res = await app.inject({
      url: '/api/v1/user',
    });
    const result = JSON.parse(res.payload);
    ct.equal(res.statusCode, 200);
    ct.equal(result.success, true);
    ct.ok(Array.isArray(result.data));
  });

  t.test('find user', async (ct) => {
    const res = await app.inject({
      url: '/api/v1/user/1',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const result = JSON.parse(res.payload);
    ct.equal(res.statusCode, 200);
    ct.equal(result.success, true);
    ct.ok(result.data.id);
    ct.ok(result.data.name);
    ct.ok(result.data.email);
    ct.ok(result.data.phone);
  });

  t.test('unauthenticate find user', async (ct) => {
    const res = await app.inject({
      url: '/api/v1/user/1',
      headers: {
        authorization: '',
      },
    });
    ct.equal(res.statusCode, 401);
  });

  t.test('create user', async (ct) => {
    const payload = {
      name: 'TEST USER',
      email: 'testuser@email.com',
      phone: '1231231231',
    };
    const res = await app.inject({
      method: 'POST',
      payload,
      url: '/api/v1/user',
      headers: {},
    });
    const result = JSON.parse(res.payload);
    ct.equal(res.statusCode, 201);
    ct.equal(result.success, true);
    ct.equal(result.data.name, payload.name);
    ct.equal(result.data.email, payload.email);
    ct.equal(result.data.phone, payload.phone);
  });
});
