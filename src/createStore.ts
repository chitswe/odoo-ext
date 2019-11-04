import {
  createStore,
  combineReducers,
  compose,
  Middleware,
  MiddlewareAPI,
  Dispatch,
  applyMiddleware
} from "redux";
import { rootReducer, RootState, RootAction } from "./browser/reducer";
import { persistStore, persistReducer, Persistor } from "redux-persist";
import {
  createWhitelistFilter,
  createBlacklistFilter
} from "redux-persist-transform-filter";
import { Store } from "redux";
import { AuthResult } from "./server/auth";
import update from "immutability-helper";
import { siteActions } from "./browser/reducer/site";

const asyncDispatchMiddleWare: Middleware = (middleWareapi: MiddlewareAPI) => (
  next: Dispatch<RootAction>
) => (action: RootAction) => {
  let syncActivityFinished = false;
  let actionQueue: RootAction[] = [];
  function flushQueue() {
    actionQueue.forEach(a => middleWareapi.dispatch(a));
    actionQueue = [];
  }
  function asyncDispatch(asyncAction: RootAction) {
    actionQueue = actionQueue.concat([asyncAction]);

    if (syncActivityFinished) {
      flushQueue();
    }
  }
  const actionWithAsyncDispatch = Object.assign({}, action, {
    asyncDispatch
  });

  next(actionWithAsyncDispatch);
  syncActivityFinished = true;
  flushQueue();
};
export const createServerStore = (authResult: AuthResult) => {
  let initialState = rootReducer(
    {
      site: undefined,
      loadingBar: undefined,
      stockPicking: undefined,
      labelPrintSetting: undefined,
      priceList: undefined,
      priceChange: undefined,
      priceChangeDetail: undefined,
      stockMove: undefined,
    },
    { type: "" }
  );
  initialState = update(initialState, {
    site: {
      userSession: {
        authenticated: {
          $set: authResult.authenticated
        },
        access_token: {
          $set: authResult.access_token
        },
        username: {
          $set: authResult.username
        }
      }
    }
  });

  const persistor: Persistor = undefined;

  const store = createStore<RootState, RootAction, {}, {}>(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(asyncDispatchMiddleWare),
      // If you are using the devToolsExtension, you can add it here also
      typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : (f: any) => f
    )
  );
  return { store, persistor };
};

export const createClientStore = () => {
  const autoMergeLevel2 = require("redux-persist/lib/stateReconciler/autoMergeLevel2");
  const storage = require("redux-persist/lib/storage");
  const persistConfig = {
    key: "root",
    storage: storage.default,
    whitelist: ["labelPrintSetting", "stockMove"],
    transforms: [createWhitelistFilter("labelPrintSetting", ["url"]), createWhitelistFilter("stockMove")],
    stateReconciler: autoMergeLevel2.default
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const promise = new Promise<{
    store: Store;
    persistor: Persistor;
  }>((resolve, reject) => {
    try {
      const store = createStore(
        persistedReducer,
        compose(
          applyMiddleware(asyncDispatchMiddleWare),
          // If you are using the devToolsExtension, you can add it here also
          typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__
            ? window.__REDUX_DEVTOOLS_EXTENSION__()
            : (f: any) => f
        )
      );
      const { authenticated, username, access_token } = window.__AUTH_STATE__;
      store.dispatch(
        siteActions.setUserSession({ authenticated, username, access_token })
      );
      let persistor = persistStore(store, {}, () =>
        resolve({ store, persistor })
      );
    } catch (e) {
      reject(e);
    }
  });
  return promise;
};
