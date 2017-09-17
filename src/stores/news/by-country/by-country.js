import {createAction, handleActions} from 'redux-actions';
import {query as queryGraphQL} from '../../graphql-service';

// Types
const INIT = 'news/by-country/INIT';
const LOAD = 'news/by-country/LOAD';
const FAIL = 'news/by-country/FAIL';

// Actions
const init = createAction(INIT);
const load = createAction(LOAD);
const fail = createAction(FAIL);

async function getData(name, limit = 10) {
  const data = await queryGraphQL(
   `query NewsByCountry($country: CountryFilter, $limit: Int) {
      allNews(last: $limit filter: {
        countries_some: $country
      }) {
        id
        title
      }
    }`,
    {country: {name}, limit}
  );

  return data.allNews;
}

export function get(country, limit = 10) {
  return async dispatch => {
    dispatch(init({ref: country}));
    try {
      const news = await getData(country, limit);
      dispatch(load({ref: country, items: news}));
    } catch(e) {
      dispatch(fail({ref: country, msg: e}))
    }
  };
}

// State
const initialState = {
  lookup: {}
};

// Reducers
export const reducer = handleActions({
  [INIT]: (state, {payload}) => {
    const key = payload.ref.toLowerCase();
    const lookup = Object.assign({}, state.lookup, {
      [key]: {loading: true, items: null, failed: false}
    });
    return Object.assign(state, {lookup});
  },
  [LOAD]: (state, {payload}) => {
    const key = payload.ref.toLowerCase();
    const item = Object.assign({}, state.lookup[key], {items: payload.items, loading: false});
    const lookup = Object.assign({}, state.lookup, {[key]: item});
    return Object.assign(state, {lookup});
  },
  [FAIL]: (state, {payload}) => {
    const key = payload.ref.toLowerCase();
    const item = Object.assign({}, state.lookup[key], {failed: true, loading: false, msg: payload.msg});
    const lookup = Object.assign({}, state.lookup, {[key]: item});
    return Object.assign(state, {lookup});
  }
}, initialState);

export default reducer;

export function loading(state, name) {
  const key = (name || '').toLowerCase();
  const item = state.lookup[key];
  return item != null ? item.loading : null;
}

export function failed(state, name) {
  const key = (name || '').toLowerCase();
  const item = state.lookup[key];
  return item != null ? item.failed : null;
}

export function items(state, name) {
  const key = (name || '').toLowerCase();
  const item = state.lookup[key];
  return item != null ? item.items : null;
}
