import { UserSession } from "../browser/reducer/site";

declare global {
  interface Window {
    __AUTH_STATE__: UserSession;
    __APOLLO_STATE__: {};
    __REDUX_DEVTOOLS_EXTENSION__(): (f: any) => any;
  }
}
export {};
