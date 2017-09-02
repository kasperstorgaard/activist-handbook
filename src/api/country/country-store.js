import {createAction} from 'redux-actions';
import {addReducers} from '../add-reducers';
import {query} from '../graphql-service';

// Types
const INIT = 'country/INIT';
const LOAD = 'country/LOAD';
export const types = {INIT, LOAD}

// Actions
const init = ReduxActions.createAction(INIT);
const load = ReduxActions.createAction(LOAD);

async function getData(name) {
  const data = await query(
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
    const data = await getName(name);
    dispatch(load(data));
  }
}

// State
const initialState = {
  loading: false,
  data: null
};

// Reducers
export const reducer = ReduxActions.handleActions({
  [INIT]: (state, {payload}) => Object.assign({}, state, {loading: true }),
  [LOAD]: (state, {payload}) => Object.assign({}, state, {data: payload, loading: false})
}, initialState);


export default reducer;