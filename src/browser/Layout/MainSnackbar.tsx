import * as React from "react";
import { Snackbar } from "@material-ui/core";

import { siteActions } from "../reducer/site";
import { connect } from "react-redux";
import { RootState, RootAction } from "../reducer";
import { Dispatch, bindActionCreators } from "redux";
type Props = {
  isSnackbarOpen: boolean;
  snackbarMessage: string;
  closeSnackbar: typeof siteActions.closeSnackbar;
};

const MainSnackBar: React.SFC<Props> = ({
  isSnackbarOpen,
  snackbarMessage,
  closeSnackbar
}) => {
  return (
    <Snackbar
      open={isSnackbarOpen}
      message={snackbarMessage}
      onClose={closeSnackbar}
    />
  );
};

export default connect(
  ({ site: { isSnackbarOpen, snackbarMessage } }: RootState) => {
    return {
      isSnackbarOpen,
      snackbarMessage
    };
  },
  (dispatch: Dispatch<RootAction>) =>
    bindActionCreators(
      {
        closeSnackbar: siteActions.closeSnackbar
      },
      dispatch
    )
)(MainSnackBar);
