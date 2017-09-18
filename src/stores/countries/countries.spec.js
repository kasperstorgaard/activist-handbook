import td from 'testdouble';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import * as sut from './countries';

const fetch = td.function();
global.fetch = fetch;

function buildStore() {
  return createStore(sut.reducer, applyMiddleware(thunk));
}

function mockData() {
  return [
    { id: 1, name: 'denmark', code: ['DK', 'DNK'] },
    { id: 2, name: 'sweden', code: ['SE', 'SWE'] },
    { id: 3, name: 'norway', code: ['NO', 'NOR'] }
  ];
}

function buildResponse(data) {
  return {
    data: { allCountries: data }
  }
}

function mockApi(promises = [Promise.resolve(mockData())]) {

  td.when(fetch(
    td.matchers.contains('//api.graph.cool'), td.matchers.anything()))
      .thenReturn(...promises.map(async data => {
        const response = await buildResponse(await data);
        return {json: async() => response};
      }));
}

function setup() {
  mockApi();
  return buildStore();
}

afterEach(() => td.reset());

test('all() sets loading to true', async () => {
  const store = setup();

  store.dispatch(sut.all());

  expect(store.getState().loading).toBe(true);
});

test('all() sets items after response', async () => {
  const store = setup();

  await store.dispatch(sut.all());

  expect(store.getState().items).toEqual([
    { id: 1, name: 'denmark', code: ['DK', 'DNK'] },
    { id: 2, name: 'sweden', code: ['SE', 'SWE'] },
    { id: 3, name: 'norway', code: ['NO', 'NOR'] }
  ]);
});

test('all() sets loading to false after response', async () => {
  const store = setup();

  await store.dispatch(sut.all());

  expect(store.getState().loading).toBe(false);
});

test('all() sets items=null after failed response', async () => {
  const store = buildStore();
  mockApi([Promise.reject()]);

  await store.dispatch(sut.all());

  expect(store.getState().items).toBe(null);
});

test('all() sets loading=false after failed response', async () => {
  const store = buildStore();
  mockApi([Promise.reject()]);

  await store.dispatch(sut.all());

  expect(store.getState().loading).toBe(false);
});

test('all() sets failed=true after failed response', async () => {
  const store = buildStore();
  mockApi([Promise.reject()]);

  await store.dispatch(sut.all());

  expect(store.getState().failed).toBe(true);
});

test('all() sets failed=false after second request', async () => {
  const store = buildStore();
  mockApi([Promise.reject()]);

  await store.dispatch(sut.all());
  store.dispatch(sut.all());

  expect(store.getState().failed).toBe(false);
});

test('query() sets filtered empty if no items', async () => {
  const store = setup();

  store.dispatch(sut.query());

  expect(store.getState().filtered).toEqual([]);
});

test('query() filters items by name', async () => {
  const store = setup();

  await store.dispatch(sut.all());
  store.dispatch(sut.query('den'));

  expect(store.getState().filtered).toEqual([
    {id: 1, name: 'denmark', code: ['DK', 'DNK']},
    {id: 2, name: 'sweden', code: ['SE', 'SWE']}
  ]);
});

test('query() filters items by code[0]', async () => {
  const store = setup();

  await store.dispatch(sut.all());
  store.dispatch(sut.query('dk'));

  expect(store.getState().filtered).toEqual([
    {id: 1, name: 'denmark', code: ['DK', 'DNK']}
  ]);
});

test('query() sorts equal name matches by alphabet', async () => {
  mockApi([Promise.resolve([
    {id: 1, name: 'serbia', code: ['RS', 'SRB']},
    {id: 2, name: 'senegal', code: ["SN", "SEN"]}
  ])]);
  const store = buildStore();

  await store.dispatch(sut.all());
  store.dispatch(sut.query('se'));

  expect(store.getState().filtered).toEqual([
    {id: 2, name: 'senegal', code: ["SN", "SEN"]},
    {id: 1, name: 'serbia', code: ["RS", "SRB"]}
  ]);
});

test('query() ranks code[0] matches before name matches', async () => {
  mockApi([Promise.resolve([
    {id: 1, name: 'serbia', code: ["RS", "SRB"]},
    {id: 2, name: 'sweden', code: ['SE', 'SWE']}
  ])]);
  const store = buildStore();

  await store.dispatch(sut.all());
  store.dispatch(sut.query('se'));

  expect(store.getState().filtered).toEqual([
    {id: 2, name: 'sweden', code: ['SE', 'SWE']},
    {id: 1, name: 'serbia', code: ["RS", "SRB"]}
  ]);
});