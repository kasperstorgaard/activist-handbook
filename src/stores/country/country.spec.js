import td from 'testdouble';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as sut from './country';

const fetch = td.function();
global.fetch = fetch;

function buildStore() {
  return createStore(sut.reducer, applyMiddleware(thunk));
}

function mockApi(options = {}) {
  const data = {
    Country: {
      id: 1,
      name: 'denmark',
      code: ['DK', 'DNK'],
      region: 'Europe'
    }
  };

  const target = td.when(fetch(td.matchers.contains('//api.graph.cool'), td.matchers.anything()));

  if (!options.fail) {
    target.thenResolve({json: async() => ({data})});
  } else {
    target.thenReject();
  }

  const geoJson = {type: 'FeatureCollection', features: []};

  td.when(fetch(td.matchers.contains('.geo.json')))  
    .thenResolve({json: async() => ({data: geoJson})});
}

function setup() {
  mockApi();
  return buildStore();
}

afterEach(() => td.reset());

test('get() sets loading=true', async () => {
  const store = setup();

  store.dispatch(sut.get());

  expect(store.getState().loading).toBe(true);
});

test('get() sets data after response from endpoint', async () => {
  const store = setup();

  await store.dispatch(sut.get());

  expect(store.getState().data).toEqual({
    id: 1,
    name: 'denmark',
    code: ['DK', 'DNK'],
    region: 'Europe',
    geo: expect.any(Object)
  });
});

test('get() sets loading=false after response', async () => {
  const store = setup();

  await store.dispatch(sut.get());

  expect(store.getState().loading).toBe(false);
});

test('get() sets data=null when endpoint fails', async () => {
  // we need a custom setup for this test.
  const store = buildStore();
  mockApi({fail: true})

  await store.dispatch(sut.get());

  expect(store.getState().data).toBe(null)
});

test('get() sets failed=true when endpoint fails', async () => {
  // we need a custom setup for this test.
  const store = buildStore();
  mockApi({fail: true});

  await store.dispatch(sut.get());

  expect(store.getState().failed).toBe(true)
});

test('get() sets failed=false when second request starts', async () => {
  // we need a custom setup for this test.
  const store = buildStore();
  mockApi({fail: true});

  await store.dispatch(sut.get());

  store.dispatch(sut.get());

  expect(store.getState().failed).toBe(false);
});