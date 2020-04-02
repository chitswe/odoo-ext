import * as React from "react";
import {
  TextField,
  Theme,
  createStyles,
  WithStyles,
  withStyles,
  Button,
  Typography
} from "@material-ui/core";
import { RouteComponentProps, withRouter } from "react-router";
import { compose } from "react-apollo";
import { AuthResult } from "../../server/auth";
import { bindActionCreators, Dispatch } from "redux";
import { RootAction } from "../reducer";
import { connect } from "react-redux";
import { siteActions } from "../reducer/site";
import {
  showLoading as showLoadingAction,
  hideLoading as hideLoadingAction
} from "react-redux-loading-bar";

const styles = (theme: Theme) =>
  createStyles({
    title: {
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit
    },
    textField: {
      flex: 1
    },
    wrapper: {
      width: 300,
      display: "flex",
      flexDirection: "column",
      height: 200,
      flexWrap: "wrap"
    },
    root: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      display: "flex"
    }
  });

type State = {
  email: string;
  password: string;
};

type Props = {
  setUserSession: typeof siteActions.setUserSession;
  showLoading: typeof showLoadingAction;
  hideLoading: typeof hideLoadingAction;
  showSnackbar: typeof siteActions.openSnackbar;
} & RouteComponentProps &
  WithStyles<typeof styles>;

class Login extends React.Component<Props, State> {
  state: State = {
    email: "",
    password: ""
  };

  async tryLogin() {
    const { email, password } = this.state;
    const {
      showLoading,
      hideLoading,
      showSnackbar,
      setUserSession, 
      history
    } = this.props;
    showLoading();
    try {
      const result: AuthResult = await fetch("/login", {
        method: "POST",
        body: JSON.stringify({ username: email, password }),
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => {
        return response.json();
      });
      if (result.authenticated) {
        delete result.odoo;
        delete result.error;
        setUserSession(result);
      } else {
        showSnackbar(`Could not login! ${result.error}`);
      }
    } catch (e) {
      showSnackbar(`Could  not login! ${e.message ? e.message : e.toString()}`);
    }

    hideLoading();
  }

  render() {
    const { email, password: passport } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.wrapper}>
          <Typography variant="subtitle1" className={classes.title}>
            Log in with your Odoo Account.
          </Typography>
          <TextField
            label="Email"
            value={email}
            type="email"
            onChange={e => {
              this.setState({ email: e.target.value });
            }}
            className={classes.textField}
          />
          <TextField
            label="Password"
            type="password"
            value={passport}
            onChange={e => {
              this.setState({ password: e.target.value });
            }}
            className={classes.textField}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.tryLogin();
            }}
          >
            Log in
          </Button>
        </div>
      </div>
    );
  }
}

export default compose(
  withRouter,
  withStyles(styles),
  connect(
    () => ({}),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          setUserSession: siteActions.setUserSession,
          showLoading: showLoadingAction,
          hideLoading: hideLoadingAction,
          showSnackbar: siteActions.openSnackbar
        },
        dispatch
      )
  )
)(Login);
