import * as React from "react";
import {
  IconButton,
  createStyles,
  WithStyles,
  withStyles
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { siteActions } from "../../reducer/site";
import { compose } from "react-apollo";
import { connect } from "react-redux";
import { RootState, RootAction } from "../../reducer";
import { Dispatch, bindActionCreators } from "redux";
const styles = createStyles({
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
});
type Props = {
  openDrawer: typeof siteActions.toggleDrawer;
} & WithStyles<typeof styles>;
class OpenDrawerButton extends React.PureComponent<Props> {
  render() {
    const { classes, openDrawer } = this.props;
    return (
      <IconButton
        onClick={openDrawer}
        className={classes.menuButton}
        color="inherit"
        aria-label="Open drawer"
      >
        <MenuIcon />
      </IconButton>
    );
  }
}

export default compose(
  connect(
    (state: RootState) => ({}),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          openDrawer: siteActions.toggleDrawer
        },
        dispatch
      )
  ),
  withStyles(styles)
)(OpenDrawerButton);
