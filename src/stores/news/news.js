import {createAction, handleActions} from 'redux-actions';
import {query as queryGraphQL} from '../graphql-service';

// Types
const INIT = 'news/INIT';
const LOAD = 'news/LOAD';
const SELECT = 'news/SELECT';
const FAIL = 'news/FAIL';

// Actions
const init = createAction(INIT);
const load = createAction(LOAD);
export const select = createAction(SELECT);
const fail = createAction(FAIL);

async function getData(name, limit = 10) {
  const query = name ? {country: {name}, limit} : {limit};

  const data = await queryGraphQL(
   `query NewsByCountry($country: CountryFilter, $limit: Int) {
      allNews(last: $limit filter: {
        countries_some: $country
      }) {
        id
        title
        position
      }
    }`,
    query
  );

  return data.allNews;
}

export function get(country, limit = 10) {
  return async dispatch => {
    dispatch(init());
    try {
      const data = await getData(country, limit);
      dispatch(load(data));
    } catch(error) {
      dispatch(fail([error]));
    }
  };
}

// State
const initialState = {
  loading: false,
  items: null,
  selected: null,
  errors: null
};

// Reducers
export const reducer = handleActions({
  [INIT]: state => Object.assign(state, {loading: true, items: null, errors: null}),
  [LOAD]: (state, {payload}) => Object.assign(state, {loading: false, items: payload}),
  [SELECT]: (state, {payload}) => {
    const item = state.items == null || !payload ? null :
      state.items.find(item => item.id === payload);
    return Object.assign(state, {selected: item || null});
  },
  [FAIL]: (state, {payload}) => Object.assign(state, {loading: false, errors: payload})
}, initialState);

export default reducer;