import td from 'testdouble';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as sut from './country';

const fetch = td.function();
global.fetch = fetch;

function buildStore() {
  return createStore(sut.reducer, applyMiddleware(thunk));
}

function mockData() {
  return {
    id: 1,
    name: 'denmark',
    code: ['DK', 'DNK'],
    region: 'Europe'
  };
}
function buildResponse(data) {
  return {data: {Country: data}};
}

function mockApi(promises = [Promise.resolve(mockData())]) {
  td.when(fetch(td.matchers.contains('//api.graph.cool'), td.matchers.anything()))
    .thenReturn(...promises.map(async promise => {
      const response = buildResponse(await promise);
      return ({json: async() => response});
    }));

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
  mockApi([Promise.reject]);

  await store.dispatch(sut.get());

  expect(store.getState().data).toBe(null)
});

test('get() sets failed=true when endpoint fails', async () => {
  // we need a custom setup for this test.
  const store = buildStore();
  mockApi([Promise.reject]);

  await store.dispatch(sut.get());

  expect(store.getState().failed).toBe(true)
});

test('get() sets failed=false when second request starts', async () => {
  // we need a custom setup for this test.
  const store = buildStore();
  mockApi([Promise.reject]);

  await store.dispatch(sut.get());

  store.dispatch(sut.get());

  expect(store.getState().failed).toBe(false);
});