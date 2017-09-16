import {createAction, handleActions} from 'redux-actions';
import {query as queryGraphQL} from '../graphql-service';

// Types
const INIT = 'import/INIT';
const CREATE = 'import/CREATE';
const CREATED = 'import/CREATED';
const ERROR = 'import/ERROR';
const FAILED = 'import/FAILED';
const SUCCESS = 'import/SUCCESS';

const init = createAction(INIT);
const uploadStart = createAction(CREATE);
const uploadDone = createAction(CREATED);
const uploadError = createAction(ERROR);
const failed = createAction(FAILED);
const success = createAction(SUCCESS);

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
export function upload(countries) {
  return async dispatch => {
    dispatch(init());

    const connections = countries.map(async country =>
    {
      await dispatch(uploadStart(country));

      try {
        await createCountry(country);
        await dispatch(uploadDone());
      } catch(error) {
        await dispatch(uploadError(error));
        throw error;
      }
    });

    try {
      const result = await Promise.all(connections);
      dispatch(success(result));
    } catch (errors) {
      dispatch(failed(errors));
    }
  }
}

// State
const initialState = {
  errors: [],
  pending: 0,
  done: 0,
  uploading: false,
  failed: false
};

// Reducers
export const reducer = handleActions({
  [INIT]: (state, {payload}) =>
    Object.assign({}, state, {uploading: true, failed: false, done: 0, pending: 0, errors: []}),
  [CREATE]: (state, {payload}) =>
    Object.assign({}, state, {pending: state.pending + 1}),
  [CREATED]: (state, {payload}) =>
    Object.assign({}, state, {pending: state.pending - 1, done: state.done + 1}),
  [ERROR]: (state, {payload}) =>
    Object.assign({}, state, {pending: state.pending - 1, errors: state.errors.concat([payload])}),
  [FAILED]: (state, {payload}) =>
    Object.assign({}, state, {failed: true, uploading: false}),
  [SUCCESS]: (state, {payload}) =>
    Object.assign({}, state, {failed: false, uploading: false})
}, initialState);


export default reducer;

// Helpers
export function progress(state) {
  const total = state.done + state.errors.length + state.pending;

  return Math.floor((state.pending / total) * 100);
}