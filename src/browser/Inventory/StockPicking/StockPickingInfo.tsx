import * as React from "react";
import { stockPickingFindQuery } from "./graphql";
import { Query as ApolloQuery } from "react-apollo";
import { StockPickingFindQuery, StockPickingFindQueryVariables } from "./types";
import { stockPickingActions } from "../../reducer/stockPicking";
import { StockPickingType } from "./resolvedTypes";
import {
  Typography,
  createStyles,
  WithStyles,
  withStyles,
  Grid
} from "@material-ui/core";
import { RootState, RootAction } from "../../reducer";
import { Dispatch, bindActionCreators } from "redux";
import { compose } from "react-apollo";
import { connect } from "react-redux";

const styles = createStyles({
  fieldWrapper: {
    display: "flex",
    marginBottom: 8,
    flexWrap: "nowrap"
  },
  label: {
    width: 116,
    textAlign: "right",
    marginRight: 8
  },
  root: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8
  }
});

type ReduxProps = {
  selectedIndex?: number;
  selectedPicking?: StockPickingType;
  setSelectedStockPicking: typeof stockPickingActions.setSelectedPicking;
};

type Props = { id: number} & ReduxProps & WithStyles<typeof styles>;
class Query extends ApolloQuery<
  StockPickingFindQuery,
  StockPickingFindQueryVariables
> {}
class StockPicking extends React.PureComponent<Props> {
  render() {
    const { id, classes, selectedPicking, setSelectedStockPicking } = this.props;
    return (
      <Query 
        query={stockPickingFindQuery} 
        variables={{ id }}
        // onCompleted={data => {
        //   if (data && data.stockPicking && data.picking !== selectedPicking)
        //     setSelectedStockPicking({data:data.picking});
        // }}
      >
        {({ data, loading }) => {
          if (loading || !data || !data.picking) return null;
          const {
            name,
            scheduled_date,
            location,
            location_dest,
            picking_type,
            partner,
            state
          } = data.picking;
          if (data && data.picking && data.picking !== selectedPicking)
            setSelectedStockPicking({data: data.picking, index: null});

          return (
            <div className={classes.root}>
              <Typography variant="h6">{name}</Typography>
              <Grid container>
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={3}
                  className={classes.fieldWrapper}
                >
                  <Typography className={classes.label} variant="subtitle2">
                    Date:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(scheduled_date).formatAsLongDate()}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={3}
                  className={classes.fieldWrapper}
                >
                  <Typography className={classes.label} variant="subtitle2">
                    From:
                  </Typography>
                  <Typography variant="body2">{location.name}</Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={3}
                  className={classes.fieldWrapper}
                >
                  <Typography className={classes.label} variant="subtitle2">
                    To:
                  </Typography>
                  <Typography variant="body2">{location_dest.name}</Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={3}
                  className={classes.fieldWrapper}
                >
                  <Typography className={classes.label} variant="subtitle2">
                    Operation Type:
                  </Typography>
                  <Typography variant="body2">{picking_type.name}</Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={3}
                  className={classes.fieldWrapper}
                >
                  <Typography className={classes.label} variant="subtitle2">
                    Partner:
                  </Typography>
                  <Typography variant="body2">
                    {partner ? partner.name : ""}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={3}
                  className={classes.fieldWrapper}
                >
                  <Typography className={classes.label} variant="subtitle2">
                    Status:
                  </Typography>
                  <Typography variant="body2">{state}</Typography>
                </Grid>
              </Grid>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    ({ stockPicking: { selectedPicking } }: RootState) => ({
      selectedIndex: selectedPicking.index,
      selectedPicking: selectedPicking.data
    }),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        { setSelectedStockPicking: stockPickingActions.setSelectedPicking },
        dispatch
      )
  )
)(StockPicking);
