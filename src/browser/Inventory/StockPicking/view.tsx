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
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@material-ui/core";
import { Route, RouteComponentProps, Switch } from "react-router";
import StockMoveGrid from "./StockMoveGrid";
import StockMoveLineGrid from "./StockMoveLineGrid";
import StockMoveLineEditor from "./StockMoveLineEditor";
import MediaQuery from "../../../common/MediaQuery";
import { StockMoveType, StockMoveLineType, OperationType, StockPickingType } from "./resolvedTypes";
import OpenDrawerButton from "../../component/AppBar/OpenDrawerButton";
import { compose, Mutation } from "react-apollo";
import { RootState, RootAction } from "../../reducer";
import { connect } from "react-redux";
import { stockMoveActions, InputStockMoveLineType } from "../../reducer/stockMove";
import { FaBarcode, FaCogs } from "react-icons/fa";
import { MdSave, MdAssignment } from "react-icons/md";
import { Dispatch, bindActionCreators } from "redux";
import { Query } from "react-apollo";
import { generateProductLotMutation, stockMoveLineFindByStockMoveId, stockMoveFindByPickingId, createStockMoveLineMutation } from "./graphql";
import {
  stockPickingActions,
  SerialNoLabelData,
  LabelPrintStatus,
  PrintingStatus
} from "../../reducer/stockPicking";
import { PickingState } from "./types";

const styles = (theme: Theme) =>
  createStyles({
    grow: { flexGrow: 1 },
    appBar: {
      color: "#fff"
    },
    root: {},
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
  printLabel: typeof stockPickingActions.printSerialNoLabel;
  labelPrintStatus: LabelPrintStatus;
  printUrl: string;
  resetLabelPrintStatus: typeof stockPickingActions.resetLabelPrintStatus;
} & WithStyles<typeof styles> &
  RouteComponentProps<{ id: string }>;

type State = {
  selectedStockMove: StockMoveType;
  selectedStockMoveId: number;
  pickingState: PickingState;
  operationType: OperationType;
  selectedIndex?: number;
  selectedProductCode?: string;
  totalQty: number;
  balanceQty: number;
  tracking?: string;
  saveLoading: boolean;
};

class StockPicking extends React.Component<Props, State> {
  state: State = {
    pickingState: null,
    operationType: null,
    selectedStockMove: null,
    selectedStockMoveId: null,
    selectedIndex: null,
    tracking: null,
    selectedProductCode: "",
    totalQty: null,
    balanceQty: null,
    saveLoading: false
  };
  renderAppBar(appBarType: "stock_move" | "stock_move_line" | "stock_move_line_edit" | "both", routeComponentProps: any) {
    const {
      classes,
      selectedStockMoveLine,
      selectedStockPicking,
      match,
      stockMoveLineList, history, editStockMoveLine, selectedMoveIndex, removeStockMoveLine,
      printUrl
    } = this.props;

    const { selectedStockMove, pickingState } = this.state;
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
          {
            (appBarType === "stock_move" || appBarType === "both") && 
            (selectedStockMove &&
              (selectedStockMove.product.tracking === "serial" ||
                selectedStockMove.product.tracking === "lot")) && 
              selectedStockPicking.state === "assigned" && this.state.balanceQty > 0 ?

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
                  variables: { pickingId, stockMoveId: moveId }
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
          {appBarType === "stock_move_line" || appBarType === "both" ? (
            <IconButton
              aria-label="Print barcode label"
              color="inherit"
              onClick={() => {
                const { printLabel } = this.props;
                printLabel({
                  printUrl,
                  printingIndex: 0
                });
              }}
            >
              <FaBarcode />
            </IconButton>
          ) : null}
          {(appBarType === "stock_move" || appBarType === "both") &&
          (selectedStockMove &&
            (selectedStockMove.product.tracking === "serial" ||
              selectedStockMove.product.tracking === "lot")) ? (
            <Mutation
              mutation={generateProductLotMutation}
              refetchQueries={() => {
                return [
                  {
                    query: stockMoveLineFindByStockMoveId,
                    variables: { stockMoveId: selectedStockMove.id, pickingId }
                  },
                  {
                    query: stockMoveFindByPickingId,
                    variables: { id: pickingId }
                  }
                ];
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
                        moveId: selectedStockMove.id
                      }
                    });
                  }}
                >
                  <FaCogs />
                </IconButton>
              )}
            </Mutation>
          ) : null}
        </Toolbar>
      </AppBar>
    );
  }
  renderPrintingDialogs() {
    const { labelPrintStatus, resetLabelPrintStatus } = this.props;
    const { stockMoveInfo } = labelPrintStatus;
    return (
      <React.Fragment>
        <Dialog
          open={labelPrintStatus.printingStatus === PrintingStatus.printing}
        >
          <DialogTitle>Printing Barcode Label</DialogTitle>
          <DialogContent>
            {labelPrintStatus.printingMoveLine ? (
              <Typography>
                {`Printing ${stockMoveInfo.product_default_code} , 
                ${labelPrintStatus.printingMoveLine.lot_name}`}
              </Typography>
            ) : null}
          </DialogContent>
        </Dialog>
        <Dialog
          open={labelPrintStatus.printingStatus === PrintingStatus.error}
          onClose={resetLabelPrintStatus}
        >
          <DialogTitle> Filed to print barcode</DialogTitle>
          <DialogContent>
            <Typography>{labelPrintStatus.errorText.toString()}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetLabelPrintStatus} color="primary" autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
  render() {
    const {
      match,
      classes,
      history,
      labelPrintStatus,
      selectedStockPicking,
      resetLabelPrintStatus
    } = this.props;
    const { selectedIndex, selectedStockMove } = this.state;
    const selected = selectedIndex || selectedIndex === 0 ? [selectedIndex] : [];
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
                    stockMoveId={Number.parseInt(
                      routeComponentProps.match.params.moveId,
                      10
                    )}
                    pickingId={id}
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
                            tracking: rowData.product.tracking ? rowData.product.tracking : "",
                            selectedStockMove: rowData
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
                            selectedStockMove: rowData,
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
                          stockMoveId={
                            selectedStockMove
                              ? selectedStockMove.id
                              : Number.parseInt(
                                  routeComponentProps.match.params.moveId,
                                  10
                                )
                          }
                          pickingId={id}
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
                  <Query
                    query={stockMoveLineFindByStockMoveId}
                    ssr={false}
                    variables={{ pickingId: id, stockMoveId: Number.parseInt(routeComponentProps.match.params.moveId, 10) }}
                    onCompleted={data => {
                      if (data && data.picking) {
                        let { stock_move, state, operation_type } = data.picking;
                        let { move_lines, product, product_uom_qty } = stock_move;
                        if (product.default_code !== this.state.selectedProductCode) {
                          this.setState({
                            selectedProductCode: product ? product.default_code : "", operationType: operation_type , pickingState: state, balanceQty: product_uom_qty - (move_lines ? move_lines.edges.length : 0)
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
                        pickingState={this.state.pickingState}
                        operationType={this.state.operationType}
                        stockMoveId={
                          selectedStockMove
                            ? selectedStockMove.id
                            : Number.parseInt(
                                routeComponentProps.match.params.moveId,
                                10
                              )
                        }
                      />
                    )
                    }
                  </Query>
                </Grid>
              )}
            />
            <Route
              path={`${match.url}`}
              render={routeComponentProps => {
                if (selectedStockMove)
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
                                selectedStockMove: rowData,
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
                            stockMoveId={selectedStockMove.id}
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
                                selectedStockMove: rowData,
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
        {this.renderPrintingDialogs()}
      </React.Fragment>
    );
  }
}
export default compose(
  withStyles(styles),
  connect(
    ({ stockPicking: { selectedPicking, selectedStockMoveLine, labelPrintStatus }, stockMove: { stockMoveLineList }, labelPrintSetting }: RootState) => ({
      selectedStockMoveLine,
      selectedStockPicking: selectedPicking.data,
      stockMoveLineList,
      printUrl: labelPrintSetting.url,
      labelPrintStatus 
    }), 
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          editStockMoveLine: stockMoveActions.editMoveLine,
          removeStockMoveLine: stockMoveActions.removeMoveLine,
          printLabel: stockPickingActions.printSerialNoLabel,
          resetLabelPrintStatus: stockPickingActions.resetLabelPrintStatus
        },
        dispatch
      )
  )
)(StockPicking);