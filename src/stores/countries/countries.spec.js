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
    allCountries: [
      { id: 1, name: 'denmark', countryCode: 'DK' },
      { id: 2, name: 'sweden', countryCode: 'SE' },
      { id: 3, name: 'norway', countryCode: 'NO' }
    ]
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

test('all() sets loading to true', async () => {
  const store = setup();

  store.dispatch(sut.all());

  expect(store.getState().loading).toBe(true);

  teardown();
});

test('all() sets items after response', async () => {
  const store = setup();

  await store.dispatch(sut.all());

  expect(store.getState().items).toEqual([
    { id: 1, name: 'denmark', countryCode: 'DK' },
    { id: 2, name: 'sweden', countryCode: 'SE' },
    { id: 3, name: 'norway', countryCode: 'NO' }
  ]);

  teardown();
});

test('all() sets loading to false after response', async () => {
  const store = setup();

  await store.dispatch(sut.all());

  expect(store.getState().loading).toBe(false);

  teardown();
});

test('all() sets items=null after failed response', async () => {
  const store = buildStore();
  mockAPI({fail: true});

  await store.dispatch(sut.all());

  expect(store.getState().items).toBe(null);

  teardown();
});

test('all() sets loading=false after failed response', async () => {
  const store = buildStore();
  mockAPI({fail: true});

  await store.dispatch(sut.all());

  expect(store.getState().loading).toBe(false);

  teardown();
});

test('all() sets failed=true after failed response', async () => {
  const store = buildStore();
  mockAPI({fail: true});

  await store.dispatch(sut.all());

  expect(store.getState().failed).toBe(true);

  teardown();
});

test('all() sets failed=false after second request', async () => {
  const store = buildStore();
  mockAPI({fail: true});

  await store.dispatch(sut.all());
  store.dispatch(sut.all());

  expect(store.getState().failed).toBe(false);

  teardown();
});

test('query() sets filtered empty if no items', async () => {
  const store = setup();

  store.dispatch(sut.query());

  expect(store.getState().filtered).toEqual([]);

  teardown();
});

test('query() filters items by name', async () => {
  const store = setup();

  await store.dispatch(sut.all());
  store.dispatch(sut.query('den'));

  expect(store.getState().filtered).toEqual([
    {id: 1, name: 'denmark', countryCode: 'DK'},
    {id: 2, name: 'sweden', countryCode: 'SE'}
  ]);

  teardown();
});

test('query() filters items by countryCode', async () => {
  const store = setup();

  await store.dispatch(sut.all());
  store.dispatch(sut.query('dk'));

  expect(store.getState().filtered).toEqual([
    {id: 1, name: 'denmark', countryCode: 'DK'}
  ]);

  teardown();
});

test('query() sorts equal name matches by alphabet', async () => {
  const store = buildStore();
  const data = {
    allCountries: [
      {id: 1, name: 'serbia', countryCode: 'RS'},
      {id: 2, name: 'senegal', countryCode: 'SN'}
    ]
  };
  mockAPI({data});

  await store.dispatch(sut.all());
  store.dispatch(sut.query('se'));

  expect(store.getState().filtered).toEqual([
    {id: 2, name: 'senegal', countryCode: 'SN'},
    {id: 1, name: 'serbia', countryCode: 'RS'}
  ]);

  teardown();
});

test('query() ranks countryCode matches before name matches', async () => {
  const store = buildStore();
  const data = {
    allCountries: [
      {id: 1, name: 'serbia', countryCode: 'RS'},
      {id: 2, name: 'sweden', countryCode: 'SE'}
    ]
  };
  mockAPI({data});

  await store.dispatch(sut.all());
  store.dispatch(sut.query('se'));

  expect(store.getState().filtered).toEqual([
    {id: 2, name: 'sweden', countryCode: 'SE'},
    {id: 1, name: 'serbia', countryCode: 'RS'}
  ]);

  teardown();
});