import {combineReducers} from 'redux';
import {reducer as latestReducer} from './latest/latest';
import {reducer as byCountryReducer} from './by-country/by-country';
import * as ByCountry from "./by-country/by-country";

const reducers = {
  byCountry: byCountryReducer
};

export const reducer = combineReducers(reducers);
export default reducer;

// Make Sub stores available to importers.
export {ByCountry, Latest};