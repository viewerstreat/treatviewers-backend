import {test} from 'tap';
import {QuestionSchema} from '../../src/models/question';
import {build} from '../helper';

test('question routes', async (t) => {
  const app = await build(t);
  const tokenRes = await app.inject({
    url: '/api/v1/tempApiGetToken',
    query: {userId: '1', name: 'test'},
  });
  const {token} = JSON.parse(tokenRes.payload);

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
  const contestRes = await app.inject({
    method: 'POST',
    url: '/api/v1/contest',
    headers: {authorization: `Bearer ${token}`},
    payload: {...contestPayload},
  });
  const contestResult = JSON.parse(contestRes.payload);

  t.test('unauthenticated create question', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/clip',
      payload: {},
    });
    ct.equal(res.statusCode, 401);
  });

  const payload: QuestionSchema = {
    contestId: contestResult.data._id,
    questionNo: 1,
    questionText: 'Test question 1',
    options: [
      {
        optionId: 1,
        optionText: 'Answer 1',
        isCorrect: false,
      },
      {
        optionId: 2,
        optionText: 'Answer 2',
        isCorrect: false,
      },
      {
        optionId: 3,
        optionText: 'Answer 3',
        isCorrect: true,
      },
      {
        optionId: 4,
        optionText: 'Answer 4',
        isCorrect: false,
      },
    ],
  };

  t.test('create question without contestId', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/question',
      headers: {authorization: `Bearer ${token}`},
      payload: {...payload, contestId: null},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create question invalid contestId', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/question',
      headers: {authorization: `Bearer ${token}`},
      payload: {...payload, contestId: '62bbd2cc9cf8d73bfe39001f'},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create question without questionText', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/question',
      headers: {authorization: `Bearer ${token}`},
      payload: {...payload, questionText: ''},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create question without options', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/question',
      headers: {authorization: `Bearer ${token}`},
      payload: {...payload, options: null},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create question options must be of length 4', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/question',
      headers: {authorization: `Bearer ${token}`},
      payload: {
        ...payload,
        options: [
          {
            optionId: 1,
            optionText: 'Answer 1',
            isCorrect: false,
          },
        ],
      },
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create question invalid optionId', async (ct) => {
    const temp = {...payload};
    const options = payload.options?.map((el) => ({...el}));
    temp.options = options;
    if (temp.options && temp.options?.length > 0) {
      temp.options[0].optionId = 5;
    }
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/question',
      headers: {authorization: `Bearer ${token}`},
      payload: {...temp},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create question duplicate optionId', async (ct) => {
    const temp = {...payload};
    const options = payload.options?.map((el) => ({...el}));
    temp.options = options;
    if (temp.options && temp.options?.length > 0) {
      temp.options[0].optionId = 2;
    }
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/question',
      headers: {authorization: `Bearer ${token}`},
      payload: {...temp},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('create question', async (ct) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/question',
      headers: {authorization: `Bearer ${token}`},
      payload: {...payload},
    });
    const result = JSON.parse(res.payload);
    ct.equal(res.statusCode, 200);
    ct.equal(result.success, true);
    ct.match(result.data, payload);
  });

  t.test('unauthenticated get question', async (ct) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/question',
    });
    ct.equal(res.statusCode, 401);
  });

  t.test('get question without contestId', async (ct) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/question',
      headers: {authorization: `Bearer ${token}`},
      query: {contestId: '', questionNo: ''},
    });
    ct.equal(res.statusCode, 400);
  });

  t.test('get question', async (ct) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/question',
      headers: {authorization: `Bearer ${token}`},
      query: {contestId: contestResult.data._id, questionNo: '1'},
    });
    ct.equal(res.statusCode, 200);
    const result = JSON.parse(res.payload);
    ct.equal(result.success, true);
    ct.ok(result.data._id);
    ct.ok(result.data.questionText);
    ct.ok(result.data.options);
    ct.equal(result.data.contestId, contestResult.data._id);
    ct.equal(result.data.questionNo, 1);
  });
});
