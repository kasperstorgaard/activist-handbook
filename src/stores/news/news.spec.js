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
    id: 'id0',
    title: 'just a little title',
    body: 'some body text here',
    position: [1, 9]
  }, {
    id: 'id1',
    title: 'another title',
    body: 'some other body text here',
    position: [1, 9]
  }, {
    id: 'id2',
    title: 'last title',
    body: 'text some body here',
    position: [1, 9]
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

  expect(store.getState().errors).toBe(null);
});

test('get() resets items', async () => {
  mockApi([Promise.reject(), Promise.resolve(mockData())]);
  const store = buildStore();

  await store.dispatch(sut.get());
  store.dispatch(sut.get());

  expect(store.getState().items).toBe(null);
});

test('get() resets selected', async () => {
  mockApi([Promise.reject(), Promise.resolve(mockData())]);
  const store = buildStore();

  await store.dispatch(sut.get());
  store.dispatch(sut.get('id1'));
  store.dispatch(sut.get());

  expect(store.getState().selected).toBe(null);
});

test('get() overwrites items', async () => {
  mockApi([Promise.resolve(mockData()), Promise.resolve([mockData()[0]])])
  const store = buildStore();

  await store.dispatch(sut.get());
  await store.dispatch(sut.get());

  expect(store.getState().items.length).toBe(1);
});

test('get() should set selected=null if no returned items', async () => {
  mockApi([Promise.resolve([])]);
  const store = buildStore();

  await store.dispatch(sut.get());

  expect(store.getState().selected).toBe(null);
});

test('get() should select first item', async () => {
  const store = setup();

  await store.dispatch(sut.get());

  expect(store.getState().selected.id).toBe('id0');
});

test('get() should overwrite selected', async () => {
  const store = setup();

  await store.dispatch(sut.get());
  store.dispatch(sut.select('id1'));
  await store.dispatch(sut.get());

  expect(store.getState().selected.id).toBe('id0');
});

test('select() selects nothing if no args', () => {
  const store = setup();

  store.dispatch(sut.select());

  expect(store.getState().selected).toBe(null);
});

test('select(name) selects item by name', async () => {
  const store = setup();

  await store.dispatch(sut.get());
  store.dispatch(sut.select('id1'));

  expect(store.getState().selected.id).toBe('id1');
});

test('select(name) selects item by name', async () => {
  const store = setup();

  store.dispatch(sut.select('id1'));

  expect(store.getState().selected.id).toBe('id1');
});

test('select(name) selects nothing if no matching item', () => {
  const store = setup();

  store.dispatch(sut.select('not_a_match'));

  expect(store.getState().selected).toBe(null);
});

test('select(name) overwrites previous selection', async () => {
  const store = setup();

  await store.dispatch(sut.get());
  store.dispatch(sut.select('id1'));
  store.dispatch(sut.select('id2'));

  expect(store.getState().selected.id).toBe('id2');
});
