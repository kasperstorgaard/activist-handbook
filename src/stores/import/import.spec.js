import td from 'testdouble';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as sut from './import';

const fetch = td.function();
global.fetch = fetch;

function buildStore() {
  return createStore(sut.reducer, applyMiddleware(thunk));
}

function mockData() {
  return [{
    "name": "Albania",
    "code": ["AL", "ALB"],
    "regions": ["Europe", "Southern Europe"],
    "position": ["41.153332", "20.168331"]
  }, {
    "name": "Algeria",
    "code": ["DZ", "DZA"],
    "regions": ["Africa", "Northern Africa"],
    "position": ["28.033886", "1.659626"]
  }, {
    "name": "Andorra",
    "code": ["AD", "AND"],
    "regions": ["Europe", "Southern Europe"],
    "position": ["42.546245", "1.601554"]
  }];
}

async function mockAPI(options = {}) {
  const fail = options.fail;
  const resolvers = options.resolvers || [Promise.resolve()];

  const target = td.when(fetch(
    td.matchers.contains('//api.graph.cool'), td.matchers.anything()));

  if (!fail) {
    // This is needed for individual control of when multiple fetches resolve.
    const returns = resolvers.map(async resolver => {
      await resolver;
      return { json: async() => ({data: null})};
    });
    target.thenReturn(...returns);
  } else {
    target.thenReject();
  }
}

function setup() {
  mockAPI();
  return buildStore();
}

afterEach(() => td.reset());

test('uploading() returns true when upload is not done', async () => {
  mockAPI({fail: true});
  const store = buildStore();

  store.dispatch(sut.single(mockData()[0]));

  expect(sut.uploading(store.getState())).toBe(true);
});

test('uploading() returns false when done', async () => {
  const store = setup();

  await store.dispatch(sut.single(mockData()[0]));

  expect(sut.uploading(store.getState())).toBe(false);
});

test('progress() returns 66 after uploading 2 of 3 files.', async () => {
  const store = setup();

  await store.dispatch(sut.single(mockData()[0]));
  await store.dispatch(sut.single(mockData()[1]));
  store.dispatch(sut.single(mockData()[2]));

  expect(sut.progress(store.getState())).toBe(66);
});

test('single() adds to uploaded when done', async () => {
  const store = setup();

  await store.dispatch(sut.single(mockData()[0]));

  expect(store.getState().uploaded.length).toBe(1);
});

test('single() adds to errors when upload fails', async() => {
  mockAPI({fail: true});
  const store = buildStore();

  await store.dispatch(sut.single(mockData()[0]));

  expect(store.getState().errors.length).toBe(1);
});

test('reset() resets existing errors', async() => {
  mockAPI({fail: true});
  const store = buildStore();

  await store.dispatch(sut.single(mockData()[0]));
  store.dispatch(sut.reset());
  expect(store.getState().errors.length).toBe(0);
});