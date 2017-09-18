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

function buildResponse() {
  return { data: {} };
}

async function mockApi(promises = [Promise.resolve()]) {
  const target = td.when(fetch(
    td.matchers.contains('//api.graph.cool'), td.matchers.anything()));

  // This is needed for individual control of when multiple fetches resolve.
  target.thenReturn(...promises.map(async data => {
    const response = buildResponse(await data);
    return {json: async() => response};
  }));
}

function setup() {
  mockApi();
  return buildStore();
}

afterEach(() => td.reset());

test('uploading() returns true when upload is not done', async () => {
  mockApi([Promise.reject()]);
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
  mockApi([Promise.reject()]);
  const store = buildStore();

  await store.dispatch(sut.single(mockData()[0]));

  expect(store.getState().errors.length).toBe(1);
});

test('reset() resets existing errors', async() => {
  mockApi([Promise.reject()]);
  const store = buildStore();

  await store.dispatch(sut.single(mockData()[0]));
  store.dispatch(sut.reset());
  expect(store.getState().errors.length).toBe(0);
});