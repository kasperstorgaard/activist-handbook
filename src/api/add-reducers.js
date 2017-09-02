import {store, reducers} from "./root-store";

export function addReducers(lazyReducers) {
  Object.assign(reducers, lazyReducers);
  const reducer = combineReducers(reducers);
  store.replaceReducer(reducer);
}