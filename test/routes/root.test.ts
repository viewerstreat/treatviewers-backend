import {test} from 'tap';
import {build} from '../helper';

test('root route', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/api/v1/ping',
  });
  t.same(JSON.parse(res.payload), {success: true, message: 'Server running successfully!'});
});
