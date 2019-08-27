import * as React from "react";
import StockPickingInfo from "./StockPickingInfo";
import {
  Grid,
  createStyles,
  WithStyles,
  withStyles,
  Theme,
  Typography,
  IconButton,
  AppBar,
  Toolbar
} from "@material-ui/core";
import { Route, RouteComponentProps, Switch } from "react-router";
import StockMoveGrid from "./StockMoveGrid";
import StockMoveLineGrid from "./StockMoveLineGrid";
import MediaQuery from "../../../common/MediaQuery";
import { StockMoveType } from "./resolvedTypes";
import OpenDrawerButton from "../../component/AppBar/OpenDrawerButton";
import { compose, Mutation } from "react-apollo";
import { RootState } from "../../reducer";
import { connect } from "react-redux";
import { StockPickingType } from "./resolvedTypes";
import { FaBarcode, FaCogs } from "react-icons/fa";
import { generateProductLotMutation, stockMoveLineFindByStockMoveId, stockMoveFindByPickingId } from "./graphql";

const styles = (theme: Theme) =>
  createStyles({
    grow: { flexGrow: 1 },
    appBar: {
      color: "#fff"
    },
    root: {
      
    },
    fill: {
      flex: 1
    },
    row: {
      flex: 1,
      flexWrap: "nowrap"
    },
    loadingIndicator: {
      backgroundColor: "#DDDDDD",
      color: "#DDDDDD",
      width: 150,
      display: "inline"
    },
    fillBackground: {
      backgroundColor: theme.palette.grey[100]
    },
    stockMoveGridLine: {
      width: 550
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20
    },
    toolBar: {
      [theme.breakpoints.up("md")]: {
        minHeight: 48
      }
    }
  });
type Props = {
  selectedStockMoveLine: ReadonlyArray<number>;
  selectedStockPicking: StockPickingType
} & WithStyles<typeof styles> &
  RouteComponentProps<{ id: string }>;

type State = {
  selectedStockMoveId?: number;
  selectedIndex?: number;
  tracking?: string;
};
class StockPicking extends React.Component<Props, State> {
  state: State = {
    selectedStockMoveId: null,
    selectedIndex: null,
    tracking: null
  };
  renderAppBar(appBarType: "stock_move" | "stock_move_line" | "both") {
    const { classes, selectedStockMoveLine, selectedStockPicking, match } = this.props;
    const pickingId = Number.parseInt(match.params.id, 10);
    return (
      <AppBar className={classes.appBar} position="static">
        <Toolbar className={classes.toolBar}>
          <OpenDrawerButton />
          <Typography variant="h6" color="inherit" noWrap>
            {appBarType === "stock_move" || appBarType === "both"
              ? "Picking Details"
              : "Picked Serial No"}
          </Typography>
          <div className={classes.grow} />
          {(appBarType === "stock_move_line" || appBarType === "both") &&
          selectedStockMoveLine.length > 0 ? (
            <IconButton aria-label="Print barcode label" color="inherit">
              <FaBarcode />
            </IconButton>
          ) : null}
          {
            (appBarType === "stock_move" || appBarType === "both") && ( this.state.tracking === "serial" ||  this.state.tracking === "lot" ) ? 
            <Mutation
              mutation={generateProductLotMutation}   
              refetchQueries={() => {
                return [{
                   query: stockMoveLineFindByStockMoveId,
                   variables: { id: this.state.selectedStockMoveId }
               },
               {
                  query: stockMoveFindByPickingId,
                  variables: { id: pickingId }
               }];
              }}            
            >
             {(generateProductLot, { data, loading, error }) => (
                <IconButton 
                  aria-label="Generate Lot" 
                  color="inherit" 
                  onClick={() => {
                      generateProductLot({
                        variables: {
                          pickingId,
                          moveId: this.state.selectedStockMoveId
                        }
                      });                   
                  }}
                >
                  <FaCogs />
                </IconButton> 
              )
            }
            </Mutation>  : null
          }
        </Toolbar>
      </AppBar>
    );
  }
  render() {
    const { match, classes, history } = this.props;
    const { selectedIndex, selectedStockMoveId } = this.state;
    const selected =
      selectedIndex || selectedIndex === 0 ? [selectedIndex] : [];
    const id = Number.parseInt(match.params.id, 10);
    return (
      <React.Fragment>
        <MediaQuery maxWidth={959}>
          <Switch>
            <Route
              path={`${match.url}/stock_move/:moveId`}
              render={routeComponentProps => (
                <Grid container direction="column" className={classes.root}>
                  {this.renderAppBar("stock_move_line")}
                  <StockMoveLineGrid
                    loadingIndicatorClassName={classes.loadingIndicator}
                    {...routeComponentProps}
                    sotckMoveId={Number.parseInt(
                      routeComponentProps.match.params.moveId,
                      10
                    )}
                  />
                </Grid>
              )}
            />
            <Route
              path={match.url}
              render={() => {
                return (
                  <Grid container direction="column" className={classes.root}>
                    {this.renderAppBar("stock_move")}
                    <Grid item>
                      <StockPickingInfo id={id} />
                    </Grid>
                    <Grid
                      item
                      container
                      direction="row"
                      className={classes.fill}
                    >
                      <StockMoveGrid
                        selectedItems={selected}
                        loadingIndicatorClassName={classes.loadingIndicator}
                        pickingId={id}
                        scrollToIndex={selectedIndex}
                        onStockMoveItemClick={(
                          rowData: StockMoveType,
                          index: number
                        ) => {
                          this.setState({
                            selectedIndex: index,
                            selectedStockMoveId: rowData.id,
                            tracking: rowData.product.tracking ? rowData.product.tracking : ""
                          });
                          history.push(`${match.url}/stock_move/${rowData.id}`);
                        }}
                      />
                    </Grid>
                  </Grid>
                );
              }}
            />
          </Switch>
        </MediaQuery>
        <MediaQuery minWidth={960}>
          <Grid container direction="column" className={classes.root}>
            <Grid item>{this.renderAppBar("both")}</Grid>
            <Grid item>
              <StockPickingInfo id={id} />
            </Grid>
            <Grid
              container
              item
              className={classes.row}
              direction="row"
              spacing={16}
            >
              <Grid container direction="row" item xs={12}>
                <StockMoveGrid
                  rootClassName={classes.fillBackground}
                  selectedItems={selected}
                  loadingIndicatorClassName={classes.loadingIndicator}
                  pickingId={id}
                  scrollToIndex={selectedIndex}
                  onStockMoveItemClick={(
                    rowData: StockMoveType,
                    index: number
                  ) => {
                    this.setState({
                      selectedStockMoveId: rowData.id,
                      selectedIndex: index,                      
                      tracking: rowData.product.tracking ? rowData.product.tracking : ""
                    });
                  }}
                />
              </Grid>

              <Switch>
                <Route
                  path={`${match.url}/stock_move/:moveId`}
                  render={routeComponentProps => (
                    <Grid
                      container
                      direction="row"
                      item
                      className={classes.stockMoveGridLine}
                    >
                      <StockMoveLineGrid
                        rootClassName={classes.fillBackground}
                        loadingIndicatorClassName={classes.loadingIndicator}
                        {...routeComponentProps}
                        sotckMoveId={
                          selectedStockMoveId
                            ? selectedStockMoveId
                            : Number.parseInt(
                                routeComponentProps.match.params.moveId,
                                10
                              )
                        }
                      />
                    </Grid>
                  )}
                />
                <Route
                  path={`${match.url}`}
                  render={routeComponentProps => {
                    if (selectedStockMoveId)
                      return (
                        <Grid
                          container
                          direction="row"
                          item
                          className={classes.stockMoveGridLine}
                        >
                          <StockMoveLineGrid
                            rootClassName={classes.fillBackground}
                            loadingIndicatorClassName={classes.loadingIndicator}
                            {...routeComponentProps}
                            sotckMoveId={selectedStockMoveId}
                            pickingId={id}
                          />
                        </Grid>
                      );
                    else return null;
                  }}
                />
              </Switch>
            </Grid>
          </Grid>
        </MediaQuery>
      </React.Fragment>
    );
  }
}
export default compose(
  withStyles(styles),
  connect(
    (state: RootState) => ({
      selectedStockMoveLine: state.stockPicking.selectedStockMoveLine
    }),
    () => ({})
  )
)(StockPicking);
