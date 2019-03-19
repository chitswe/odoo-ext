import { HttpLink } from "apollo-link-http";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink, from } from "apollo-link";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { Store } from "redux";
import { RootState } from "./browser/reducer";
import { onError } from "apollo-link-error";
import { siteActions } from "./browser/reducer/site";
let activeRequests = 0;

const createApolloClient = (
  store: Store<RootState>,
  isSSR: boolean = false,
  graphqlEndPoint: string = isSSR
    ? "http://localhost:3030/graphql"
    : `${window.location.origin}/graphql`
) => {
  const middleWare = new ApolloLink((operation, forward) => {
    if (activeRequests === 0) {
      store.dispatch(showLoading());
    }
    activeRequests++;
    return forward(operation).map(response => {
      activeRequests--;
      if (activeRequests === 0) {
        store.dispatch(hideLoading());  
      }
      return response;
    });
  });
  const authFetch = (input: RequestInfo, init?: RequestInit) => {
    const state = store.getState();
    const token = state.site.userSession
      ? state.site.userSession.access_token
      : "";
    if (token)
      init.headers = { ...init.headers, Authorization: `Bearer ${token}` };
    return fetch(input, init).catch(error => {
      if (error.code === 20 && error.name === "AbortError") {
        activeRequests--;
        if (activeRequests === 0) {
          store.dispatch(hideLoading());
        }
      }
      throw error;
    });
  };
  const httpLink = new HttpLink({ fetch: authFetch, uri: graphqlEndPoint });
  const errorLink = onError(({ networkError }) => {
    if (networkError) {
      store.dispatch(
        siteActions.openSnackbar("Can't connect to server. Check connection!")
      );
      activeRequests--;
      if (activeRequests === 0) {
        store.dispatch(hideLoading());
      }
    }
  });
  const cache = isSSR
    ? new InMemoryCache()
    : new InMemoryCache().restore(window.__APOLLO_STATE__);
  return new ApolloClient({
    ssrMode: isSSR,
    link: from([middleWare, errorLink, httpLink]),
    cache
  });
};
export default createApolloClient;
