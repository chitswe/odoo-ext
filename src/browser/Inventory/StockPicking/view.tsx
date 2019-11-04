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
  CircularProgress,
  Toolbar
} from "@material-ui/core";
import { Route, RouteComponentProps, Switch } from "react-router";
import StockMoveGrid from "./StockMoveGrid";
import StockMoveLineGrid from "./StockMoveLineGrid";
import StockMoveLineEditor from "./StockMoveLineEditor";
import MediaQuery from "../../../common/MediaQuery";
import { StockMoveType, StockMoveLineType } from "./resolvedTypes";
import OpenDrawerButton from "../../component/AppBar/OpenDrawerButton";
import { compose, Mutation } from "react-apollo";
import { RootState, RootAction } from "../../reducer";
import { connect } from "react-redux";
import { StockPickingType } from "./resolvedTypes";
import { stockMoveActions, InputStockMoveLineType } from "../../reducer/stockMove";
import { FaBarcode, FaCogs } from "react-icons/fa";
import { MdSave, MdAssignment } from "react-icons/md";
import { Dispatch, bindActionCreators } from "redux";
import { Query } from "react-apollo";
import { generateProductLotMutation, stockMoveLineFindByStockMoveId, stockMoveFindByPickingId, createStockMoveLineMutation } from "./graphql";

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
    stockMoveEditor: {
      width: "100%"
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20
    },
    toolBar: {
      [theme.breakpoints.up("md")]: {
        minHeight: 48
      }
    },
    nondisplay: {
      display: "none"
    },
    placeCenter: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      margin: "auto"
    },
  });
type Props = {
  selectedStockMoveLine: ReadonlyArray<number>;
  selectedStockPicking: StockPickingType;
  stockMoveLineList: ReadonlyArray<InputStockMoveLineType>;
  selectedMoveIndex: number;
  editStockMoveLine: typeof stockMoveActions.editMoveLine;
  removeStockMoveLine: typeof stockMoveActions.removeMoveLine;
} & WithStyles<typeof styles> &
  RouteComponentProps<{ id: string }>;

type State = {
  selectedStockMoveId?: number;
  selectedIndex?: number;
  selectedProductCode?: string;
  totalQty: number;
  balanceQty: number;
  tracking?: string;
  saveLoading: boolean;
};
class StockPicking extends React.Component<Props, State> {
  state: State = {
    selectedStockMoveId: null,
    selectedIndex: null,
    tracking: null,
    selectedProductCode: "",
    totalQty: null,
    balanceQty: null,
    saveLoading: false
  };
  renderAppBar(appBarType: "stock_move" | "stock_move_line" | "stock_move_line_edit" | "both", routeComponentProps: any) {
    const { classes, selectedStockMoveLine, selectedStockPicking, stockMoveLineList, match, history, editStockMoveLine, removeStockMoveLine } = this.props;
    const pickingId = Number.parseInt(match.params.id, 10);
    const moveId = routeComponentProps && routeComponentProps.match.params.moveId ? Number.parseInt(routeComponentProps.match.params.moveId, 10) : this.state.selectedStockMoveId;

    return (
      <AppBar className={classes.appBar} position="static">
        <Toolbar className={classes.toolBar}>
          <OpenDrawerButton />
          <Typography variant="h6" color="inherit" noWrap>
            {appBarType === "stock_move" || appBarType === "both"
              ? "Picking Details"
              : appBarType === "stock_move_line_edit" ? <Typography variant="h6" color="inherit">{selectedStockPicking ? selectedStockPicking.name : ""}</Typography> : "Picked Serial No"}
          </Typography>
          <div className={classes.grow} />
          {(appBarType === "stock_move_line" || appBarType === "both") &&
            selectedStockMoveLine.length > 0 ? (
              <IconButton aria-label="Print barcode label" color="inherit">
                <FaBarcode />
              </IconButton>
            ) : null}
          {
            (appBarType === "stock_move" || appBarType === "both") && (this.state.tracking === "serial" || this.state.tracking === "lot") ?
              <Mutation
                mutation={generateProductLotMutation}
                refetchQueries={() => {
                  return [{
                    query: stockMoveLineFindByStockMoveId,
                    variables: { id: moveId }
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
                          moveId
                        }
                      });
                    }}
                  >
                    <FaCogs />
                  </IconButton>
                )
                }
              </Mutation> : null
          }
          {
            (appBarType === "stock_move" || appBarType === "both") && (this.state.tracking === "serial" || this.state.tracking === "lot") && selectedStockPicking.state === "assigned" && this.state.balanceQty > 0 ?

              <IconButton
                aria-label="Edit Lot"
                color="inherit"
                onClick={() => {
                  history.push(`${match.url}/stock_move_edit/${moveId}`);
                }}
              >
                <MdAssignment />
              </IconButton>
              : null
          }
          {(appBarType === "stock_move_line_edit") ?
            <Mutation
              mutation={createStockMoveLineMutation}
              onCompleted={(data) => {
                this.setState({ saveLoading: false });
                if (data.createStockMoveLine) {
                  let moveIndex = stockMoveLineList.findIndex(e => e !== null && e.lot_name === data.createStockMoveLine.lot_name && e.moveId === moveId);
                  removeStockMoveLine(moveIndex);
                  if (this.state.balanceQty > 0)
                    this.setState({ balanceQty: this.state.balanceQty - 1 });
                }
              }}
              onError={({ graphQLErrors }) => {
                this.setState({ saveLoading: false });
                graphQLErrors.map(({ extensions: { code, exception: { invalidArgs } }, message }) => {
                  if (code === "BAD_USER_INPUT" && invalidArgs && invalidArgs.lot_name)
                    editStockMoveLine({ item: { id: null, lot_name: invalidArgs.lot_name, verified: false, moveId, status: false, error: message }, index: stockMoveLineList.findIndex(e => e !== null && e.moveId === moveId && e.lot_name === invalidArgs.lot_name) });
                });
              }}
              refetchQueries={() => {
                return [{
                  query: stockMoveLineFindByStockMoveId,
                  variables: { id: moveId }
                },
                {
                  query: stockMoveFindByPickingId,
                  variables: { id: pickingId }
                }];
              }}
            >
              {
                (createStockMoveLine, { data, loading, error }) => {
                  return <IconButton
                    aria-label="Save Lot"
                    color="inherit"
                    onClick={ async() => {
                      let moveLines = stockMoveLineList.map((e, i) => ({ ...e, index: i })).filter(e => e !== null && e.moveId === moveId && e.verified === false);
                      for (let item of moveLines) {
                        if (moveLines.filter(e => e.lot_name === item.lot_name).length > 1) {
                          editStockMoveLine({ item: { id: item.id, lot_name: item.lot_name, verified: false, moveId: item.moveId, status: false, error: "Duplicate ProductLot!" }, index: item.index });
                        } else {
                          this.setState({ saveLoading: true });
                          await createStockMoveLine({
                            variables: {
                              move_id: moveId,
                              lot_name: item.lot_name
                            }
                          });
                          // .then((lot: any) => {                              
                          //   if (lot.data.createStockMoveLine) {                                
                          //     removeStockMoveLine(item.index);    
                          //     if (this.state.balanceQty > 0)
                          //       this.setState({balanceQty: this.state.balanceQty - 1});                            
                          //   } else if (lot.data.createStockMoveLine === null && selectedStockPicking.operation_type.use_existing_lots) {
                          //     editStockMoveLine({ item: { id: item.id, lot_name: item.lot_name, verified: false, moveId: item.moveId, status: false, error : "Existing Lot not found!"}, index: item.index });                            
                          //   }
                          // });
                        }
                      }
                    }}
                  >
                    <MdSave />
                  </IconButton>;
                }
              }
            </Mutation>
            : null}
        </Toolbar>
      </AppBar>
    );
  }
  render() {
    const { match, classes, history, selectedStockPicking } = this.props;
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
                  {this.renderAppBar("stock_move_line", routeComponentProps)}
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
                    {this.renderAppBar("stock_move", null)}
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
                            balanceQty: rowData.product_uom_qty - rowData.quantity_done,
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
          <Switch>
            <Route
              path={`${match.url}/stock_move/:moveId`}
              render={routeComponentProps => (
                <Grid container direction="column" className={classes.root}>
                  <Grid item>{this.renderAppBar("both", routeComponentProps)}</Grid>
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
                            balanceQty: rowData.product_uom_qty - rowData.quantity_done,
                            selectedIndex: index,
                            tracking: rowData.product.tracking ? rowData.product.tracking : ""
                          });
                        }}
                      />
                    </Grid>
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
                  </Grid>
                </Grid>
              )}
            />
            <Route
              path={`${match.url}/stock_move_edit/:moveId`}
              render={routeComponentProps => (
                <Grid container direction="column" className={classes.root}>
                  <Grid item>{this.renderAppBar("stock_move_line_edit", routeComponentProps)}</Grid>
                  <Grid item className={classes.nondisplay}>
                    <StockPickingInfo id={id} />
                  </Grid>
                  {/* <Grid
                    container
                    item
                    className={classes.row}
                    direction="row"
                    spacing={16}
                  > *
                    <Grid
                      container
                      direction="column"
                      item
                      className={classes.stockMoveEditor}
                    > */}
                  <Query
                    query={stockMoveLineFindByStockMoveId}
                    ssr={false}
                    variables={{ id: Number.parseInt(routeComponentProps.match.params.moveId, 10) }}
                    onCompleted={data => {
                      if (data && data.stock_move) {
                        let { move_lines, product, product_uom_qty } = data.stock_move;
                        if (product.default_code !== this.state.selectedProductCode) {
                          this.setState({
                            selectedProductCode: product ? product.default_code : "", balanceQty: product_uom_qty - (data.stock_move ? data.stock_move.move_lines.edges.length : 0)
                          });
                        }
                      }
                    }}
                  >
                    {({ data, loading }) => (
                      <StockMoveLineEditor
                        rootClassName={classes.fillBackground}
                        loadingIndicatorClassName={classes.loadingIndicator}
                        {...routeComponentProps}
                        pickingId={id}
                        saveLoading={this.state.saveLoading}
                        selectedProductCode={this.state.selectedProductCode}
                        totalQty={this.state.balanceQty}
                        stockMoveId={
                          selectedStockMoveId
                            ? selectedStockMoveId
                            : Number.parseInt(
                              routeComponentProps.match.params.moveId,
                              10
                            )
                        }
                      />
                    )
                    }
                  </Query>
                  {/* </Grid> */}
                  {/* </Grid> */}
                </Grid>
              )}
            />
            <Route
              path={`${match.url}`}
              render={routeComponentProps => {
                if (selectedStockMoveId)
                  return (
                    <Grid container direction="column" className={classes.root}>
                      <Grid item>{this.renderAppBar("both", routeComponentProps)}</Grid>
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
                                balanceQty: rowData.product_uom_qty - rowData.quantity_done,
                                tracking: rowData.product.tracking ? rowData.product.tracking : ""
                              });
                            }}
                          />
                        </Grid>
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
                      </Grid>
                    </Grid>
                  );
                else
                  return (
                    <Grid container direction="column" className={classes.root}>
                      <Grid item>{this.renderAppBar("both", routeComponentProps)}</Grid>
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
                                balanceQty: rowData.product_uom_qty - rowData.quantity_done,
                                tracking: rowData.product.tracking ? rowData.product.tracking : ""
                              });
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  );
              }}
            />
          </Switch>
        </MediaQuery>
      </React.Fragment>
    );
  }
}
export default compose(
  withStyles(styles),
  connect(
    ({ stockPicking: { selectedPicking, selectedStockMoveLine }, stockMove: { stockMoveLineList } }: RootState) => ({
      selectedStockMoveLine,
      selectedStockPicking: selectedPicking.data,
      stockMoveLineList
    }),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          editStockMoveLine: stockMoveActions.editMoveLine,
          removeStockMoveLine: stockMoveActions.removeMoveLine
        },
        dispatch
      )
  )
)(StockPicking);