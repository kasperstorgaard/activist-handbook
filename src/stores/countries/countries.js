import {createAction, handleActions} from 'redux-actions';
import {query as queryGraphQL} from '../graphql-service';

// Types
const INIT = 'countries/INIT';
const LOAD = 'countries/LOAD';
const QUERY = 'countries/QUERY';
const FAIL = 'countries/FAIL';

// Actions
const init = createAction(INIT);
const load = createAction(LOAD);
export const query = createAction(QUERY);
const fail = createAction(FAIL);

async function getAll() {
  const data = await queryGraphQL(`
  {
    allCountries {
      id
      name
      codeAlpha2
    }
  }
  `);
  return data.allCountries;
}

// Operations
export function all() {
  return async dispatch => {
    dispatch(init());
    try {
      const countries = await getAll();
      dispatch(load(countries));
    } catch(e) {
      dispatch(fail())
    }
  };
}

// State
const initialState = {
  loading: false,
  items: [],
  filtered: []
};

function rankItem(item, query) {
  if (item.codeAlpha2.toLowerCase() === query) {
    return 0;
  }
  const nameRank = item.name.toLowerCase().indexOf(query);
  return nameRank === -1 ? nameRank : nameRank + 1;
}

function rankItems(items, rawQuery) {
  const query = rawQuery.trim().toLowerCase();

  if (query.length === 0) {
    return (items || []).slice();
  }

  const ranked = items.reduce((ranked, item) => ranked.concat([{
      rank: rankItem(item, query),
      value: item
    }]), []);

  return ranked
    .filter(item => item.rank >= 0)
    .sort((a, b) => {
      const aFirst = a.rank !== b.rank ?
        a.rank < b.rank :
        a.value.name < b.value.name;
      return aFirst ? -1 : 1;
    })
    .map(item => item.value);
}

// Reducers
export const reducer = handleActions({
  [INIT]: (state, {payload}) =>
    Object.assign(state, {loading: true, failed: false}),
  [LOAD]: (state, {payload}) =>
    Object.assign(state, {items: payload, loading: false}),
  [QUERY]: (state, {payload}) =>
    Object.assign(state, {filtered: rankItems(state.items, payload || '')}),
  [FAIL]: (state, {payload}) =>
    Object.assign(state, {items: null, loading: false, failed: true})
}, initialState);

export default reducer;
