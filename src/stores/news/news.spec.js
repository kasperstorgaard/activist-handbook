import td from 'testdouble';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as sut from './news';

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
    body: 'some other body text here'
  }, {
    title: 'last title',
    body: 'text some body here'
  }];
}

function buildResponse(news) {
  return {
    data: {allNews: news}
  };
}

function mockApi(promises = [Promise.resolve(mockData())]) {
  const matchesApi = td.matchers.contains('//api.graph.cool');

  td.when(fetch(matchesApi, td.matchers.anything()))
    .thenReturn(...promises.map(async promise => {
      const response = buildResponse(await promise);
      return {json: async() => response};
    }))
}

function setup() {
  mockApi();
  return buildStore();
}

afterEach(() => td.reset());

test('get() sets loading=true', () => {
  const store = setup();

  store.dispatch(sut.get());

  expect(store.getState().loading).toBe(true);
});

test('get() sets loading=false after response', async() => {
  const store = setup();

  await store.dispatch(sut.get());

  expect(store.getState().loading).toBe(false);
});

test('get() sets items after response', async () => {
  const store = setup();

  await store.dispatch(sut.get());

  expect(store.getState().items.length).toBe(3);
});

test('get() sets loading=false when failed', async () => {
  mockApi([Promise.reject()]);
  const store = buildStore();

  await store.dispatch(sut.get());

  expect(store.getState().loading).toBe(false);
});

test('get() sets errors when failed', async () => {
  mockApi([Promise.reject()]);
  const store = buildStore();

  await store.dispatch(sut.get());

  expect(store.getState().errors.length).toBe(1);
});

test('get() resets errors', async () => {
  mockApi([Promise.reject(), Promise.resolve(mockData())]);
  const store = buildStore();

  await store.dispatch(sut.get());
  store.dispatch(sut.get());

  expect(store.getState().errors.length).toBe(0);
});

test('get() overwrites items', async () => {
  mockApi([Promise.resolve(mockData()), Promise.resolve([mockData()[0]])])
  const store = buildStore();

  await store.dispatch(sut.get());
  await store.dispatch(sut.get());

  expect(store.getState().items.length).toBe(1);
});
