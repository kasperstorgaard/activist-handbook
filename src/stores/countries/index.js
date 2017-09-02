import {createAction, handleActions} from 'redux-actions';
import {query} from '../graphql-service';

// Types
const INIT = 'countries/INIT';
const LOAD = 'countries/LOAD';
export const types = {INIT, LOAD}; 

// Actions
const init = createAction(INIT);
const load = createAction(LOAD);

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
    const countries = await getData();
    dispatch(load(countries));
  };
}

// State
const initialState = {
  loading: false,
  items: []
};

// Reducers
export const reducer = handleActions({
  [INIT]: (state, {payload}) => Object.assign(state, {loading: true}),
  [LOAD]: (state, {payload}) => Object.assign(state, {items: payload, loading: false})
}, initialState);

export default reducer;
