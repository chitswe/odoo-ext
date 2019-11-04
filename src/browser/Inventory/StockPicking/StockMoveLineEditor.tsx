import * as React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  ListItemAvatar,
  Avatar,
  IconButton,
  CircularProgress,
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  ListItemIcon
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import TextEditor from "../../component/TextEditor";
import { FaEdit } from "react-icons/fa";
import { stockMoveLineFindByStockMoveId, changeProductLotMutation, deleteStockMoveLineMutation } from "./graphql";
import update from "immutability-helper";
import * as _ from "lodash";
import { connect } from "react-redux";
import { RootState, RootAction } from "../../reducer";
import { stockPickingActions } from "../../reducer/stockPicking";
import { stockMoveActions, InputStockMoveLineType } from "../../reducer/stockMove";
import { Dispatch, bindActionCreators } from "redux";
import { FaCheckCircle } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { StockMoveLineType, StockPickingType } from "./resolvedTypes";
import { compose, Mutation } from "react-apollo";

type State = {
  variables: any;
  index: number;
  plot: InputStockMoveLineType;
  lotname: string;
  editState: boolean;
};

type Props = WithStyles<typeof styles> & {
  stockMoveId: number;
  pickingId: number;
  pickingType: string;
  selectedProductCode?: string;
  totalQty: number;
  loadingIndicatorClassName: string;
  saveLoading: boolean;
  rootClassName?: string;
  selectedPicking: StockPickingType;
  stockMoveLineList: ReadonlyArray<InputStockMoveLineType>;
  addStockMoveLine: typeof stockMoveActions.addMoveLine;
  editStockMoveLine: typeof stockMoveActions.editMoveLine;
  removeStockMoveLine: typeof stockMoveActions.removeMoveLine;
};

const styles = (theme: Theme) =>
  createStyles({
    created: {
      fontSize: 12,
      color: "primary",
      width: "100%",
      margin: "5px"
    },
    normal: {
      fontSize: 12,
      color: "inherit",
      width: "100%",
      margin: "5px"
    },
    num: {
      width: 100,
      verticalAlign: "middle"
    },
    lotname: {
      fontSize: 12,
      margin: "10px",
      width: "250px"
    },
    grow: {
      flexGrow: 1
    },
    list: {
      width: "100%",
      overflow: "auto",
      height: 500,
      flexGrow: 1
    },
    listitem: {
      height: "35px",      
    },
    root: {
      display: "flex",
      flex: 1,
      flexDirection: "column"
    },
    placeCenter: {
      position: "fixed",
      top: "50%",
      left: "50%",
    },
  });

class StockMoveLineEditor extends React.Component<Props, State> {
  rowsCount: number = 0;
  lastFatchedData: any = null;
  state: State = {
    variables: {},
    index: null,
    plot: undefined,
    lotname: "",
    editState: false
  };

  render() {
    const { lotname, index, plot, editState } = this.state;
    const { stockMoveLineList, editStockMoveLine, addStockMoveLine, removeStockMoveLine, stockMoveId, selectedProductCode, totalQty, classes, selectedPicking, saveLoading, loadingIndicatorClassName } = this.props;
    let moveLineQty = stockMoveLineList ? stockMoveLineList.filter(e => e !== null && e.moveId === stockMoveId).length : 0;
    return (
      <div className={classes.grow}>
        <ListItem>
          <ListItemAvatar>
            <Avatar>{selectedProductCode[0]}</Avatar>
          </ListItemAvatar>
          <ListItemText primary={selectedProductCode} />
          <ListItemText>
            <Typography className={classes.num} variant="subtitle2">
              Quantity : {totalQty}
            </Typography>
          </ListItemText>
          <ListItemText>
            {
              totalQty > moveLineQty ?
                <TextEditor
                  validateOnEnterKeyPress={true}
                  disabled={totalQty === moveLineQty}
                  onChanged={(value) => {
                    if (selectedPicking.state === "assigned")
                      this.setState({ lotname: value });
                  }}
                  onValidated={(value, oldValue) => {
                    if (value !== oldValue) {
                      this.setState({ lotname: "" });
                      addStockMoveLine({ id: null, lot_name: value, moveId: stockMoveId, verified: false, status: false, error: "" });
                    }
                  }}
                  value={lotname ? lotname : ""}
                  retainFocusOnError={true}
                  label="LotName"
                  className={classes.lotname}
                /> :
                null
            }
          </ListItemText>
        </ListItem>   
        {
          saveLoading ? 
          <div>
            <CircularProgress
                color="secondary"
                className={classes.placeCenter}
            />
          </div> : null
        } 
        <List className={classes.list}>
          {            
            stockMoveLineList && stockMoveLineList.length > 0 && stockMoveId ? stockMoveLineList.filter(e => e.moveId === stockMoveId).map((p, idx) => (              
                <ListItem key={idx} className={classes.listitem}>
                  <ListItemText>{
                    editState && idx === index ?
                      <Mutation
                        mutation={changeProductLotMutation}
                        key={p.id}
                      >
                        {(
                          changeProductLot,
                          { loading: saving, error: saveError }
                        ) => {
                          const { pickingId } = this.props;
                          return <TextEditor
                            validateOnEnterKeyPress={true}
                            onValidated={(value, oldValue) => {
                              if (value !== oldValue) {
                                if (p.id)
                                  changeProductLot({
                                    variables: {
                                      id: p.id,
                                      pickingId,
                                      lotname: value
                                    }
                                  }).then((lot: any) => {
                                    if (lot.data.changeProductLot) {
                                      removeStockMoveLine(stockMoveLineList.findIndex(e => e.lot_name === value && e.moveId === stockMoveId)); 
                                    } else if (lot.data.changeProductLot === null && selectedPicking.operation_type.use_existing_lots) {
                                      editStockMoveLine({ item: { id: null, lot_name: value, moveId: stockMoveId, verified: false, status: false, error: "Existing Lot not found!" }, index: idx });
                                    }
                                  });
                                else
                                  editStockMoveLine({ item: { id: null, lot_name: value, moveId: stockMoveId, verified: false, status: false, error: "" }, index: idx });
                                this.setState({ editState: false, index: null });
                              }
                            }}
                            retainFocusOnError={true}
                            value={plot ? plot.lot_name : ""}
                            className={classes.lotname}
                          />;
                        }
                        }
                      </Mutation>
                      :
                      <Typography className={classes.lotname} variant="subtitle2">
                        {p.lot_name}
                      </Typography>
                  }</ListItemText>
                  <ListItemText>
                    {p.verified ? <FaCheckCircle color="primary" className={classes.num} /> : null}
                    <IconButton
                      aria-label="Edit"
                      color="inherit"
                      onClick={() => {
                        this.setState({ editState: !editState, index: idx, plot: p });
                      }}
                    >
                      <FaEdit />
                    </IconButton>
                    <Mutation
                      mutation={deleteStockMoveLineMutation}
                      key={p.id}
                    >
                      {
                        (deleteStockMoveLine) => (
                          <IconButton
                            aria-label="Delete"
                            color="inherit"
                            onClick={() => {
                              if (!p.id && !p.verified)
                                removeStockMoveLine(stockMoveLineList.findIndex(e => e.lot_name === p.lot_name && e.moveId === stockMoveId)); 
                              else
                                deleteStockMoveLine({
                                  variables: { id: p.id }
                                }).then((lot: any) => {
                                  if (lot.data.deleteStockMoveLine)
                                  removeStockMoveLine(stockMoveLineList.findIndex(e => e.lot_name === p.lot_name && e.moveId === stockMoveId)); 
                                });
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )
                      }
                    </Mutation>
                    {p.error}
                    {p.error && p.error !== "" ? <MdError color="red" className={classes.num} /> : null}                  
                  </ListItemText>
                </ListItem>
              )) : null
          }
        </List>
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    ({ stockPicking: { selectedPicking }, stockMove: { stockMoveLineList } }: RootState) => ({
      stockMoveLineList,
      selectedPicking: selectedPicking.data
    }),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          editStockMoveLine: stockMoveActions.editMoveLine,
          addStockMoveLine: stockMoveActions.addMoveLine,
          removeStockMoveLine: stockMoveActions.removeMoveLine
        },
        dispatch
      )
  )
)(StockMoveLineEditor);