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
  }];
}

async function mockAPI(options = {}) {
  const fail = options.fail;
  const resolvers = options.resolvers || [Promise.resolve()];

  const target = td.when(fetch(td.matchers.contains('//api.graph.cool'), td.matchers.anything()));

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

test('upload() sets uploading to true', async () => {
  mockAPI({fail: true});
  const store = buildStore();

  store.dispatch(sut.upload());

  expect(store.getState().uploading).toBe(true);
});

test('upload() sets progress to 50 after uploading 1 of 2 files.', async () => {
  // pass in null (instant resolve) and a never resolving promise,
  //  to make sure only 1 fetch gets a response.
  const resolvers = [null, new Promise(res => null)];
  mockAPI({resolvers});
  const store = buildStore();

  store.dispatch(sut.upload(mockData()));

  // need to wait for next cycle, since I have found no better way get the right timing.
  await new Promise(setTimeout);

  const state = store.getState();
  expect(sut.progress(state)).toBe(50);
});

test('upload() sets uploading to false when done', async () => {
  const store = setup();

  await store.dispatch(sut.upload(mockData()));

  expect(store.getState().uploading).toBe(false);
});

test('upload() sets uploading to false when done', async () => {
  const store = setup();

  await store.dispatch(sut.upload(mockData()));

  expect(store.getState().uploading).toBe(false);
});

test('upload() sets uploading to false when failed', async() => {
  mockAPI({fail: true});
  const store = buildStore();

  await store.dispatch(sut.upload(mockData()));

  expect(store.getState().uploading).toBe(false);
});

test('upload() sets failed to true when failed', async() => {
  mockAPI({fail: true});
  const store = buildStore();

  await store.dispatch(sut.upload(mockData()));

  expect(store.getState().failed).toBe(true);
});