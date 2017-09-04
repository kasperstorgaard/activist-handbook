import {createAction, handleActions} from 'redux-actions';
import {query} from '../graphql-service';

// Types
const INIT = 'countries/INIT';
const LOAD = 'countries/LOAD';
const FAIL = 'countries/FAIL';

// Actions
const init = createAction(INIT);
const load = createAction(LOAD);
const fail = createAction(FAIL);

async function getData() {
  const data = await query(`
  {
    allCountries {
      id
      name
      countryCode
    }
  }
  `);
  return data.allCountries;
}

// Operations
export function hydrate() {
  return async dispatch => {
    dispatch(init());
    try {
      const countries = await getData();
      dispatch(load(countries));
    } catch(e) {
      dispatch(fail())
    }
  };
}

// State
const initialState = {
  loading: false,
  items: []
};

// Reducers
export const reducer = handleActions({
  [INIT]: (state, {payload}) =>
    Object.assign(state, {loading: true, failed: false}),
  [LOAD]: (state, { payload }) =>
    Object.assign(state, { items: payload, loading: false}),
  [FAIL]: (state, { payload }) =>
    Object.assign(state, { items: null, loading: false, failed: true})
}, initialState);

export default reducer;
