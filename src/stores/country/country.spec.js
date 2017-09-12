import nock from 'nock';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as sut from './country';

import fetch from 'node-fetch';
global.fetch = fetch;

function buildStore() {
  return createStore(sut.reducer, applyMiddleware(thunk));
}

function mockApi() {
  const data = {
    Country: {
      id: 1,
      name: 'denmark',
      codeAlpha2: 'DK'
    }
  };

  nock('https://api.graph.cool')
    .post('/simple/v1/cj6nyow1w221t0143o8gq0f9p')
    .reply(200, { data });
}

function setup() {
  mockApi();
  return buildStore();
}

function teardown() {
  nock.cleanAll();
}

test('get() sets loading=true', async () => {
  const store = setup();

  store.dispatch(sut.get());

  expect(store.getState().loading).toBe(true);

  teardown();
});

test('get() sets data after response from endpoint', async () => {
  const store = setup();

  await store.dispatch(sut.get());

  expect(store.getState().data).toEqual({
    id: 1,
    name: 'denmark',
    codeAlpha2: 'DK'
  });

  teardown();
});

test('get() sets loading=false after response', async () => {
  const store = setup();

  await store.dispatch(sut.get());

  expect(store.getState().loading).toBe(false);

  teardown();
});

test('get() sets data=null when endpoint fails', async () => {
  // we need a custom setup for this test.
  const store = buildStore();
  nock('https://api.graph.cool')
    .post('/simple/v1/cj6nyow1w221t0143o8gq0f9p')
    .reply(500);

  await store.dispatch(sut.get());

  expect(store.getState().data).toBe(null)

  teardown();
});

test('get() sets failed=true when endpoint fails', async () => {
  // we need a custom setup for this test.
  const store = buildStore();
  nock('https://api.graph.cool')
    .post('/simple/v1/cj6nyow1w221t0143o8gq0f9p')
    .reply(500);

  await store.dispatch(sut.get());

  expect(store.getState().failed).toBe(true)

  teardown();
});

test('get() sets failed=false when second request starts', async () => {
  // we need a custom setup for this test.
  const store = buildStore();
  nock('https://api.graph.cool')
    .post('/simple/v1/cj6nyow1w221t0143o8gq0f9p')
    .reply(500);

  await store.dispatch(sut.get());

  store.dispatch(sut.get());

  expect(store.getState().failed).toBe(false);

  teardown();
});