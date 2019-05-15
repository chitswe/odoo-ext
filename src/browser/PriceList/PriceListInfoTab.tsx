import * as React from "react";
import {
  Tab,
  Tabs,
  Paper,
  withStyles,
  createStyles,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  WithStyles,
  Theme
} from "@material-ui/core";
import PriceListDetail from "./PriceListDetail";
import { connect } from "react-redux";
import { RootState, RootAction } from "../reducer";
import { Dispatch } from "redux";
import { compose } from "react-apollo";
import { ProductType } from "./resolvedTypes";
import PurchasePriceHistory from "./PurchasePriceHistory";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      backgroundColor: theme.palette.grey[100]
    }
  });

type Props = {
  productId: number;
  edit: ProductType;
  allowEdit: boolean;
} & WithStyles<typeof styles>;
type State = {
  selectedTab: number;
};
class PriceListInfoTab extends React.Component<Props, State> {
  state: State = {
    selectedTab: 0
  };
  render() {
    const { selectedTab } = this.state;
    const { productId, classes, edit, allowEdit } = this.props;
    return (
      <div className={classes.root}>
        <Paper>
          {edit ? (
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  {edit.default_code ? edit.default_code[0] : edit.name[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={edit.default_code} secondary={edit.name} />
            </ListItem>
          ) : null}
          <Tabs
            value={selectedTab}
            onChange={(e, v) => {
              this.setState({ selectedTab: v });
            }}
            centered
          >
            <Tab label="Edit" />
            <Tab label="Cost" />
          </Tabs>
        </Paper>
        {selectedTab === 0 ? <PriceListDetail productId={productId} allowEdit={allowEdit}/> : null}
        {selectedTab === 1 ? (
          <PurchasePriceHistory productId={productId} />
        ) : null}
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    (state: RootState) => ({
      edit: state.priceList.edit
    }),
    (dispatch: Dispatch<RootAction>) => ({})
  )
)(PriceListInfoTab);
