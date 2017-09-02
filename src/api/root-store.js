import { createStore, combineReducers, applyMiddleware } from 'redux';

export const reducers = {};

export const store = createStore(
  combineReducers(reducers),
  (__REDUX_DEVTOOLS_EXTENSION__ || (() => null))(),
  applyMiddleware(ReduxThunk.default)
);

export default store;