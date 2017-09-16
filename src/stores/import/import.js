import {createAction, handleActions} from 'redux-actions';
import {query as queryGraphQL} from '../graphql-service';

// Types
const RESET = 'import/RESET';
const START = 'import/START';
const DONE = 'import/DONE';
const ERROR = 'import/ERROR';

export const reset = createAction(RESET);
const start = createAction(START);
const done = createAction(DONE);
const error = createAction(ERROR);

async function createCountry(country) {
  const regions = country.regions != null ? `["${country.regions.join('", "')}"]` : null;
  const code = country.code != null ? `["${country.code.join('", "')}"]` : null;
  const position = country.position != null ? `[${country.position.join(', ')}]` : null;

  await queryGraphQL(
  `mutation {
      createCountry(
        name: "${country.name}"
        code: ${code}
        regions: ${regions}
        position: ${position}
      ) {
        id
        name
      }
    }`);
}

// Operations
export function single(country) {
  return async dispatch => {
    dispatch(start(country));

    try {
      const created = await createCountry(country);
      dispatch(done({ref: country, created}));
    } catch(msg) {
      dispatch(error({ref: country, msg}));
    }
  }
}

// State
const initialState = {
  errors: [],
  uploading: [],
  uploaded: []
};

// Reducers
export const reducer = handleActions({
  [RESET]: (state, {payload}) =>
    Object.assign({}, state, {uploading: [], uploaded: [], errors: []}),
  [START]: (state, {payload}) =>
    Object.assign({}, state, {uploading: state.uploading.concat([payload])}),
  [DONE]: (state, {payload}) => Object.assign({}, state, {
    uploading: state.uploading.filter(item => item !== payload.ref),
    uploaded: state.uploaded.concat(payload)
  }),
  [ERROR]: (state, {payload}) => Object.assign({}, state, {
    uploading: state.uploading.filter(item => item !== payload.ref),
    errors: state.errors.concat([payload])
  })
}, initialState);


export default reducer;

// Helpers
export function progress(state) {
  const total = state.uploaded.length + state.errors.length + state.uploading.length;

  return 100 - Math.ceil((state.uploading.length / total) * 100);
}

export function uploading(state) {
  return state.uploading.length > 0;
}

export function failed(state) {
  return state.errors.length > 0;
}