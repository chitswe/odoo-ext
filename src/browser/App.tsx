import * as React from "react";
import MainDrawer from "./Layout/MainDrawer";
import {
  Route,
  withRouter,
  RouteComponentProps,
  Switch,
  Redirect
} from "react-router-dom";
import Inventory from "./Inventory";
import LoadingBar from "react-redux-loading-bar";
import MainSnackbar from "./Layout/MainSnackbar";
import Setting from "./component/Setting";
import Login from "./Login";
import { Button } from "@material-ui/core";
import { compose } from "react-apollo";
import { RootState } from "./reducer";
import { connect } from "react-redux";

type Props = { authenticated: boolean } & RouteComponentProps;
class App extends React.PureComponent<Props> {
  render() {
    const { authenticated } = this.props;
    return (
      <React.Fragment>
        <MainSnackbar />
        <MainDrawer />
        <LoadingBar style={{ zIndex: 200000 }} />
        {authenticated ? (
          <Switch>
            <Route path="/inventory" component={Inventory} />
            <Route path="/setting" component={Setting} />
            <Redirect
              to={{
                pathname: "/inventory"
              }}
            />
          </Switch>
        ) : (
          <Login />
        )}
      </React.Fragment>
    );
  }
}
export default compose(
  connect(
    (state: RootState) => ({
      authenticated: state.site.userSession.authenticated
    }),
    () => ({})
  )
)(App);
