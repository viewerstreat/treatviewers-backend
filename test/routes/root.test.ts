import {test} from 'tap';
import {build} from '../helper';

test('root route', async (t) => {
  const app = await build(t);

  t.test('ping route', async (ct) => {
    const res = await app.inject({
      url: '/api/v1/ping',
    });
    ct.same(JSON.parse(res.payload), {success: true, message: 'Server running successfully!'});
  });

  t.test('token route', async (ct) => {
    const res = await app.inject({
      url: '/api/v1/tempApiGetToken',
      query: {userId: '1', name: 'test'},
    });
    const payload = JSON.parse(res.payload);
    ct.ok(payload.success);
    ct.ok(payload.token);
  });
});
