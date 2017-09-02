import { createStore, combineReducers, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import {reducer as countries} from './countries/index';
import {reducer as country} from './country/index';

const reducers = {
  countries,
  country
};

export const store = createStore(
  combineReducers(reducers),
  (__REDUX_DEVTOOLS_EXTENSION__ || (() => null))(),
  applyMiddleware(ReduxThunk)
);

export function addReducers(lazyReducers) {
  Object.assign(reducers, lazyReducers);
  const reducer = combineReducers(reducers);
  store.replaceReducer(reducer);
}