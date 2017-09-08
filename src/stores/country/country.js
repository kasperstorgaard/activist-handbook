import {createAction, handleActions} from 'redux-actions';
import {query as queryGraphQL} from '../graphql-service';

// Types
const INIT = 'country/INIT';
const LOAD = 'country/LOAD';
const FAIL = 'country/FAIL';

// Actions
const init = createAction(INIT);
const load = createAction(LOAD);
const fail = createAction(FAIL);

async function getData(name) {
  const data = await queryGraphQL(
   `query CountryByName($name: String) {
      Country(name: $name) {
        id
        name
      }
    }`,
    {name}
  );

  return data.Country;
}

// Operations
export function get(name) {
  return async dispatch => {
    dispatch(init());
    try {
      const data = await getData(name);
      dispatch(load(data));
    } catch(e) {
      dispatch(fail());
    }
  }
}

// State
const initialState = {
  loading: false,
  data: null,
  failed: false
};

// Reducers
export const reducer = handleActions({
  [INIT]: (state, {payload}) =>
    Object.assign({}, state, {loading: true, failed: false}),
  [LOAD]: (state, {payload}) =>
    Object.assign({}, state, {data: payload, loading: false}),
  [FAIL]: (state, {payload}) =>
    Object.assign({}, state, {data: null, loading: false, failed: true}),
}, initialState);


export default reducer;