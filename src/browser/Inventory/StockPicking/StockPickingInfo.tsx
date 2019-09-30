import * as React from "react";
import { stockPickingFindQuery } from "./graphql";
import { Query as ApolloQuery } from "react-apollo";
import { StockPickingFindQuery, StockPickingFindQueryVariables } from "./types";
import {
  Typography,
  createStyles,
  WithStyles,
  withStyles,
  Grid
} from "@material-ui/core";

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
type Props = { id: number } & WithStyles<typeof styles>;
class Query extends ApolloQuery<
  StockPickingFindQuery,
  StockPickingFindQueryVariables
> {}
class StockPicking extends React.PureComponent<Props> {
  render() {
    const { id, classes } = this.props;
    return (
      <Query query={stockPickingFindQuery} variables={{ id }}>
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

export default withStyles(styles)(StockPicking);
