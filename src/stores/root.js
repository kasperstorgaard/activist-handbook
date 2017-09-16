import { createStore, combineReducers, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import {reducer as countriesReducer} from './countries/countries';
import {reducer as countryReducer} from './country/country';
import {reducer as importReducer} from './import/import';

const reducers = {
  countries: countriesReducer,
  country: countryReducer,
  import: importReducer
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