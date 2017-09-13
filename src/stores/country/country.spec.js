import nock from 'nock';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as sut from './country';

import fetch from 'node-fetch';
global.fetch = fetch;

function buildStore() {
  return createStore(sut.reducer, applyMiddleware(thunk));
}

function mockApi(options = {}) {
  const data = {
    Country: {
      id: 1,
      name: 'denmark',
      codeAlpha2: 'DK',
      codeAlpha3: 'DNK',
      region: 'Europe'
    }
  };

  nock('https://api.graph.cool')
    .post('/simple/v1/cj6nyow1w221t0143o8gq0f9p')
    .reply(options.fail ? 500 : 200, options.fail ? undefined : {data});

  const geoJson = {type: 'FeatureCollection', features: []};

  nock('http://localhost')
    .get(/\.geo\.json/i)
    .reply(200, {data: geoJson});
}

function setup() {
  mockApi();
  return buildStore();
}

afterEach(() => nock.cleanAll());

test('get() sets loading=true', async () => {
  const store = setup();

  // this is bc. nock still doesn't clean pending requests.
  const dispatched = store.dispatch(sut.get());
  const loading = store.getState().loading;

  await dispatched;

  expect(loading).toBe(true);
});

test('get() sets data after response from endpoint', async () => {
  const store = setup();

  await store.dispatch(sut.get());

  expect(store.getState().data).toEqual({
    id: 1,
    name: 'denmark',
    codeAlpha2: 'DK',
    codeAlpha3: 'DNK',
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