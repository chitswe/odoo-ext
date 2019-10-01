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
import MediaQuery from "../../../common/MediaQuery";
import { StockMoveType, StockMoveLineType } from "./resolvedTypes";
import OpenDrawerButton from "../../component/AppBar/OpenDrawerButton";
import { compose, Mutation } from "react-apollo";
import { RootState, RootAction } from "../../reducer";
import { connect } from "react-redux";
import { StockPickingType } from "./resolvedTypes";
import {
  stockPickingActions,
  SerialNoLabelData,
  LabelPrintStatus,
  PrintingStatus
} from "../../reducer/stockPicking";
import { FaBarcode, FaCogs } from "react-icons/fa";
import {
  generateProductLotMutation,
  stockMoveLineFindByStockMoveId,
  stockMoveFindByPickingId
} from "./graphql";
import { Dispatch, bindActionCreators } from "redux";

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
      width: 500
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
  selectedStockPicking: StockPickingType;
  printLabel: typeof stockPickingActions.printSerialNoLabel;
  labelPrintStatus: LabelPrintStatus;
  printUrl: string;
  resetLabelPrintStatus: typeof stockPickingActions.resetLabelPrintStatus;
} & WithStyles<typeof styles> &
  RouteComponentProps<{ id: string }>;

type State = {
  selectedIndex?: number;
  selectedStockMove?: StockMoveType;
};
class StockPicking extends React.Component<Props, State> {
  state: State = {
    selectedStockMove: null,
    selectedIndex: null
  };
  renderAppBar(appBarType: "stock_move" | "stock_move_line" | "both") {
    const {
      classes,
      selectedStockMoveLine,
      selectedStockPicking,
      match,
      printUrl
    } = this.props;
    const { selectedStockMove } = this.state;
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
      resetLabelPrintStatus
    } = this.props;
    const { selectedIndex, selectedStockMove } = this.state;
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
          <Grid container direction="column" className={classes.root}>
            {this.renderAppBar("both")}
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
                      selectedIndex: index,
                      selectedStockMove: rowData
                    });
                  }}
                />
              </Grid>

              <Switch>
                <Route
                  path={`${match.url}/stock_move/:moveId`}
                  render={routeComponentProps => {
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
                    );
                  }}
                />
                <Route
                  path={`${match.url}`}
                  render={routeComponentProps => {
                    if (selectedStockMove)
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
                            stockMoveId={selectedStockMove.id}
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
        {this.renderPrintingDialogs()}
      </React.Fragment>
    );
  }
}
export default compose(
  withStyles(styles),
  connect(
    (state: RootState) => ({
      selectedStockMoveLine: state.stockPicking.selectedStockMoveLine,
      printUrl: state.labelPrintSetting.url,
      labelPrintStatus: state.stockPicking.labelPrintStatus
    }),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          printLabel: stockPickingActions.printSerialNoLabel,
          resetLabelPrintStatus: stockPickingActions.resetLabelPrintStatus
        },
        dispatch
      )
  )
)(StockPicking);
