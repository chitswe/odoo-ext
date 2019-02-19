import { createAction, getType } from "typesafe-actions";
import { $Call, DeepReadonly } from "utility-types";
export const siteActions = {
  openSnackbar: createAction("site/open_snackbar", resolve => {
    return (message: string) => resolve(message);
  }),
  closeSnackbar: createAction("site/close_snackbar"),
  toggleDrawer: createAction("site/toggle_drawer"),
  setUserSession: createAction("site/setUserSession", resolve => {
    return (userSession: UserSession) => resolve(userSession);
  })
};

export type UserSession = DeepReadonly<{
  access_token?: string;
  username?: string;
  authenticated: boolean;
}>;

export type SiteState = {
  readonly isSnackbarOpen: boolean;
  readonly snackbarMessage: string;
  readonly isDrawerOpen: boolean;
  userSession: UserSession;
};

const initialState: SiteState = {
  isSnackbarOpen: false,
  snackbarMessage: "",
  isDrawerOpen: false,
  userSession: {
    authenticated: false
  }
};
export type SiteActions =
  | $Call<typeof siteActions.setUserSession>
  | $Call<typeof siteActions.openSnackbar>
  | $Call<typeof siteActions.closeSnackbar>
  | $Call<typeof siteActions.toggleDrawer>;

export const siteReducer = (
  state: SiteState = initialState,
  action: SiteActions
) => {
  switch (action.type) {
    case getType(siteActions.openSnackbar):
      return Object.assign({}, state, {
        isSnackbarOpen: true,
        snackbarMessage: action.payload
      });
    case getType(siteActions.closeSnackbar):
      return Object.assign({}, state, {
        isSnackbarOpen: false,
        snackbarMessage: ""
      });
    case getType(siteActions.toggleDrawer):
      return Object.assign({}, state, {
        isDrawerOpen: !state.isDrawerOpen
      });
    case getType(siteActions.setUserSession):
      return Object.assign({}, state, {
        userSession: Object.assign({}, state.userSession, action.payload)
      });
    default:
      return state;
  }
};
