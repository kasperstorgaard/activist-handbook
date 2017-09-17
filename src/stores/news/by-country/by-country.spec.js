import td from 'testdouble';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as sut from './by-country';

const fetch = td.function();
global.fetch = fetch;

function buildStore() {
  return createStore(sut.reducer, applyMiddleware(thunk));
}

function mockData() {
  return [{
    title: 'just a little title',
    body: 'some body text here'
  }, {
    title: 'another title',
    body: 'some body text here'
  }];
}

function mockAPI(options = {}) {
  const data = {
    allNews: options.data || mockData()
  };

  const target = td.when(fetch(td.matchers.contains('//api.graph.cool'), td.matchers.anything()));

  if (!options.fail) {
    target.thenResolve({json: async() => ({data})});
  } else {
    target.thenReject();
  }
}

function setup() {
  mockAPI();
  return buildStore();
}

afterEach(() => td.reset());

test('loading(state, name) sets loading true', async () => {
  const store = setup();

  store.dispatch(sut.get('denmark'));

  const loading = sut.loading(store.getState(), 'denmark');
  expect(loading).toBe(true);
});

test('loading(state, name) sets loading false when loaded', async () => {
  const store = setup();

  await store.dispatch(sut.get('denmark'));

  const loading = sut.loading(store.getState(), 'denmark');
  expect(loading).toBe(false);
});

test('failed(state, name) returns false when not failed', async () => {
  const store = setup();

  await store.dispatch(sut.get('denmark'));

  const failed = sut.failed(store.getState(), 'denmark');
  expect(failed).toBe(false);
});

test('failed(state, name) returns true when failed', async () => {
  mockAPI({fail: true});
  const store = buildStore();

  await store.dispatch(sut.get('denmark'));

  const failed = sut.failed(store.getState(), 'denmark');
  expect(failed).toBe(true);
});

test('items(state, name) gets the news by country when defined', async () => {
  const store = setup();

  await store.dispatch(sut.get('denmark'));

  const news = sut.items(store.getState(), 'denmark');
  expect(news.length).toBe(2);
});

test('items(state, name) gets null when not defined', async () => {
  const store = setup();

  await store.dispatch(sut.get('denmark'));

  const news = sut.items(store.getState(), 'nowhere');
  expect(news).toBe(null);
});