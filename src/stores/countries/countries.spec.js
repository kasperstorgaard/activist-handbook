import nock from 'nock';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as sut from './countries';

import fetch from 'node-fetch';
global.fetch = fetch;

function buildStore() {
  return createStore(sut.reducer, applyMiddleware(thunk));
}

function mockResponse() {
  return {
    allCountries: [{
      id: 1,
      name: 'denmark',
      countryCode: 'DK'
    }]
  };
}

function mockAPI(options = {}) {
  const fail = options.fail;
  const data = options.data || mockResponse();

  nock('https://api.graph.cool')
    .post('/simple/v1/cj6nyow1w221t0143o8gq0f9p')
    .reply(fail ? 500 : 200, !fail ? { data } : undefined);
}

function setup() {
  mockAPI();
  return buildStore();
}

function teardown() {
  nock.cleanAll();
}

test('hydrate() sets loading to true', async () => {
  const store = setup();

  store.dispatch(sut.hydrate());

  expect(store.getState().loading).toBe(true);

  teardown();
});

test('hydrate() sets items after response', async () => {
  const store = setup();

  await store.dispatch(sut.hydrate());

  expect(store.getState().items).toEqual([{
    id: 1,
    name: 'denmark',
    countryCode: 'DK'
  }]);

  teardown();
});

test('hydrate() sets loading to false after response', async () => {
  const store = setup();

  await store.dispatch(sut.hydrate());

  expect(store.getState().loading).toBe(false);

  teardown();
});

test('hydrate() sets items=null after failed response', async () => {
  const store = buildStore();
  mockAPI({fail: true});

  await store.dispatch(sut.hydrate());

  expect(store.getState().items).toBe(null);

  teardown();
});

test('hydrate() sets loading=false after failed response', async () => {
  const store = buildStore();
  mockAPI({fail: true});

  await store.dispatch(sut.hydrate());

  expect(store.getState().loading).toBe(false);

  teardown();
});

test('hydrate() sets failed=true after failed response', async () => {
  const store = buildStore();
  mockAPI({fail: true});

  await store.dispatch(sut.hydrate());

  expect(store.getState().failed).toBe(true);

  teardown();
});

test('hydrate() sets failed=false after second request', async () => {
  const store = buildStore();
  mockAPI({fail: true});

  await store.dispatch(sut.hydrate());
  store.dispatch(sut.hydrate());

  expect(store.getState().failed).toBe(false);

  teardown();
});