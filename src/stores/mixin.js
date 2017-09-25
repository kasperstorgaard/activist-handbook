import {store} from './root.js';

export function Mixin(T) {
  return class extends T {
    constructor() {
      super();

      this._dispatch = store.dispatch.bind(store);
    }

    connectedCallback() {
      super.connectedCallback();

      if (!('_mapStateToProps' in this)) {
        return;
      }

      this.__handleStoreChange = () => {
        const state = store.getState();
        const props = this._mapStateToProps(state);

        if (typeof props !== 'object') {
          throw new Error('StoresStore: method `_mapStateToProps()` must return an object.');
        }

        Object.assign(this, props);
      };

      store.subscribe(this.__handleStoreChange);

      // Initialize the state.
      this.__handleStoreChange();
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      if (this.__handleStoreChange) {
        window.Stores.Root.unsubscribe(this.__handleStoreChange);
      }
    }
  };
}