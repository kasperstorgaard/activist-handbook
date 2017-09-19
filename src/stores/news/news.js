import {createAction, handleActions} from 'redux-actions';
import {query as queryGraphQL} from '../graphql-service';

// Types
const INIT = 'news/by-country/INIT';
const LOAD = 'news/by-country/LOAD';
const FAIL = 'news/by-country/FAIL';

// Actions
const init = createAction(INIT);
const load = createAction(LOAD);
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
      const data = await getData(country);
      dispatch(load(data));
    } catch(error) {
      dispatch(fail([error]));
    }
  };
}

// State
const initialState = {
  lookup: {}
};

// Reducers
export const reducer = handleActions({
  [INIT]: state => Object.assign(state, {loading: true, items: null, errors: []}),
  [LOAD]: (state, {payload}) => Object.assign(state, {loading: false, items: payload}),
  [FAIL]: (state, {payload}) => Object.assign(state, {loading: false, errors: payload})
}, initialState);

export default reducer;