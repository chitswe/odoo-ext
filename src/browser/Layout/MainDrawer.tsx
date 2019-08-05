import * as React from "react";
import Drawer from "@material-ui/core/Drawer";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
  withStyles,
  WithStyles,
  Theme,
  createStyles,
  Avatar,
  Typography,
  Button
} from "@material-ui/core";
import { Settings, Lock, AttachMoney, ShoppingCart } from "@material-ui/icons";
import { GoPackage } from "react-icons/go";
import { FaMoneyBill } from "react-icons/fa";
import { siteActions } from "../reducer/site";
import { connect } from "react-redux";
import { RootState, RootAction } from "../reducer";
import { Dispatch, bindActionCreators, compose } from "redux";
import { withRouter, RouteComponentProps } from "react-router";

const styles = (theme: Theme) =>
  createStyles({
    a: {
      width: 250
    },
    b: {
      paddingLeft: theme.spacing.unit * 4
    },
    bg: {
      backgroundImage: "url('/img/wood.jpg')",
      display: "flex",
      paddingTop: 32,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    },
    username: {
      color: "#fff",
      paddingTop: theme.spacing.unit,
      paddingBottom: theme.spacing.unit,
      display: "inline"
    },
    username_wrap: {
      display: "block"
    },
    lockout: {
      color: "#fff",
      fontSize: 16
    },
    lockoutButton: {
      padding: 0
    }
  });
interface Props extends WithStyles<typeof styles> {
  open: boolean;
  toggleDrawer: typeof siteActions.toggleDrawer;
  username: string;
  lockOut: typeof siteActions.setUserSession;
  openSnackbar: typeof siteActions.openSnackbar;
}
class MainDrawer extends React.PureComponent<Props & RouteComponentProps> {
  async tryLogout() {
    const { openSnackbar, lockOut } = this.props;
    const result = await fetch(`/logout`, {
      method: "POST"
    })
      .then(response => {
        return response.status === 200;
      })
      .catch(error => {
        openSnackbar(
          `Could not log out! ${error.message ? error.message : error}`
        );
        return false;
      });
    if (result) {
      lockOut({
        authenticated: false,
        username: "",
        access_token: ""
      });
    }
  }
  render() {
    const {
      open,
      toggleDrawer,
      classes,
      history,
      username,
      lockOut
    } = this.props;
    return (
      <Drawer open={open} onClose={toggleDrawer}>
        <div
          tabIndex={0}
          role="button"
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
        >
          <div className={classes.a}>
            <div className={classes.bg}>
              <Avatar>{username ? username[0] : ""}</Avatar>
              <div className={classes.username_wrap}>
                <Typography
                  className={classes.username}
                  color="textSecondary"
                  variant="subtitle1"
                >
                  {username}
                </Typography>
                <Button
                  className={classes.lockoutButton}
                  onClick={() => {
                    this.tryLogout();
                  }}
                >
                  <Lock className={classes.lockout} />
                </Button>
              </div>
            </div>
            <List>
              <ListItem
                button
                onClick={() => {
                  history.push("/price");
                }}
              >
                <ListItemIcon>
                  <AttachMoney />
                </ListItemIcon>
                <ListItemText>Price List</ListItemText>
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  history.push("/inventory");
                }}
              >
                <ListItemIcon>
                  <GoPackage />
                </ListItemIcon>
                <ListItemText>Inventory</ListItemText>
              </ListItem>
              <ListItem
                button
                className={classes.b}
                onClick={() => {
                  history.push("/inventory/picking");
                }}
              >
                <ListItemIcon>
                  <GoPackage />
                </ListItemIcon>
                <ListItemText>Picking</ListItemText>
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  history.push("/salesorder");
                }}
              >
                <ListItemIcon>
                  <ShoppingCart />
                </ListItemIcon>
                <ListItemText>Sales Order</ListItemText>
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  history.push("/payment");
                }}
              >
                <ListItemIcon>
                  <FaMoneyBill />
                </ListItemIcon>
                <ListItemText>Payments</ListItemText>
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  history.push("/setting");
                }}
              >
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </ListItem>
            </List>
          </div>
        </div>
      </Drawer>
    );
  }
}

export default compose(
  connect(
    (state: RootState) => ({
      open: state.site.isDrawerOpen,
      username: state.site.userSession.username
    }),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          toggleDrawer: siteActions.toggleDrawer,
          lockOut: siteActions.setUserSession,
          openSnackbar: siteActions.openSnackbar
        },
        dispatch
      )
  ),
  withStyles(styles),
  withRouter
)(MainDrawer);
