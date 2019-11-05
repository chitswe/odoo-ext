import * as React from "react";
import {
  GridColumn,
  CheckBoxColumnMode
} from "../../component/VirtualizedGrid";
import TextEditor from "../../component/TextEditor";
import { StockMoveLineType } from "./resolvedTypes";
import ApolloVirtualizedGrid, {
  ApolloListResult
} from "../../component/VirtualizedGrid/ApolloVirtualizedGrid";
import {
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core";
import { stockMoveLineFindByStockMoveId } from "./graphql";
import update from "immutability-helper";
import * as _ from "lodash";
import { connect } from "react-redux";
import { RootState, RootAction } from "../../reducer";
import { stockPickingActions, StockMoveInfo } from "../../reducer/stockPicking";
import { Dispatch, bindActionCreators } from "redux";
import { FaCheckCircle } from "react-icons/fa";
import { compose, Mutation } from "react-apollo";
import { changeProductLotMutation } from "./graphql";
import { ProductTracking } from "./types";
import NumberEditor from "../../component/NumberEditor";

type State = {
  columns: ReadonlyArray<GridColumn<StockMoveLineType>>;
  variables: any;
  selectedAll: boolean;
};

type Props = WithStyles<typeof styles> & {
  stockMoveId: number;
  pickingId: number;
  loadingIndicatorClassName: string;
  rootClassName?: string;
  mode: string;
  selectedItems: ReadonlyArray<number>;
  setSelected: typeof stockPickingActions.setSelectedStockMoveLine;
  clearSelected: typeof stockPickingActions.clearSelectedStockMoveLine;
  addSelected: typeof stockPickingActions.addSelectedStockMoveLine;
  removeSelected: typeof stockPickingActions.removeSelectedStockMoveLine;
  setStockMoveLines: typeof stockPickingActions.setStockMoveLines;
  setStockMoveInfo: typeof stockPickingActions.setStockMoveInfo;
  stockMoveInfo: StockMoveInfo;
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
      color : "inherit",
      width: "100%",
      margin: "5px"
    }
  });

class StockMoveLineGrid extends React.Component<Props, State> {
  rowsCount: number = 0;
  state: State = {
    selectedAll: false,
    columns: [
      {
        label: "id",
        key: "id",
        width: 75,
        labelAlign: "right",
        textAlign: "right",
        sortable: true,
        hideAt: 500
      },
      // {
      //   label: "Qty",
      //   labelAlign: "right",
      //   textAlign: "center",
      //   key: "quant",
      //   width: 50,
      //   sortable: false,
      //   format: ({ key, rowData: { quant } }) =>		
      //     quant ? quant.quantity : ""
      // },
      {
        label: "Serial No", 
        key: "lot_name",
        flexGrow: 1,
        width: 350,
        sortable: false,
        format: ({ key, rowData: { lot_name } }) => lot_name ? lot_name : ""
        // format: ({ key, rowData: { id, lot_name, product_lot } }) =>	{
        //     if ( this.props.mode === "edit")
        //       return (
        //         <Mutation
        //           mutation={changeProductLotMutation}
        //           key={id}
        //         >
        //           {(
        //             changeProductLot,
        //             { loading: saving, error: saveError }
        //           ) =>  {
        //               const { classes, pickingId } = this.props;
        //               return  <TextEditor    
        //                           onValidated={(value, oldValue) => {
        //                             if (value !== oldValue)
        //                               changeProductLot({
        //                                 variables: {
        //                                   id,
        //                                   pickingId,
        //                                   lotname: value
        //                                 }
        //                               });
        //                           }}
        //                           retainFocusOnError={true}
        //                           error={!!saveError}
        //                           helperText={
        //                             saveError ? "Could not saved!" : ""
        //                           }
        //                           label=""
        //                           value={lot_name ? lot_name : ""}                    
        //                           className={product_lot && product_lot.created ? classes.created : classes.normal}
        //                           // onChanged={value => {
        //                           //   setEdit(value);
        //                           // }}
        //                       />;
        //               }
        //           }
        //         </Mutation>);
        //     else
        //     return (
        //       <Typography variant="subtitle2">{lot_name ? lot_name : ""} </Typography>
        //       );
        //   }  
        // label: "Qty",
        // key: "quant",
        // flexGrow: 1,
        // width: 50,
        // sortable: false,
        // format: ({ key, rowData: { quant } }) => (quant ? quant.quantity : "")
      },
      // {
      //   label: "Serial No",
      //   key: "lot_name",
      //   flexGrow: 1,
      //   width: 200,
      //   sortable: true,
      //   format: ({ key, rowData: { id, lot_name, product_lot } }) => (
      //     <Mutation mutation={changeProductLotMutation} key={id}>
      //       {(changeProductLot, { loading: saving, error: saveError }) => {
      //         const { classes, pickingId } = this.props;
      //         return (
      //           <TextEditor
      //             onValidated={(value, oldValue) => {
      //               if (value !== oldValue)
      //                 changeProductLot({
      //                   variables: {
      //                     id,
      //                     pickingId,
      //                     lotname: value
      //                   }
      //                 });
      //             }}
      //             retainFocusOnError={true}
      //             error={!!saveError}
      //             helperText={saveError ? "Could not saved!" : ""}
      //             label=""
      //             value={lot_name ? lot_name : ""}
      //             className={
      //               product_lot && product_lot.created
      //                 ? classes.created
      //                 : classes.normal
      //             }
      //             // onChanged={value => {
      //             //   setEdit(value);
      //             // }}
      //           />
      //         );
      //       }}
      //     </Mutation>
      //   )
      // }
    ],
    variables: {}
  };
  get headerComponent() {
    const { stockMoveInfo, setStockMoveInfo } = this.props;
    if (stockMoveInfo && stockMoveInfo.picking_number) {
      return (
        <React.Fragment>
          <ListItem>
            <ListItemAvatar>
              <Avatar>{stockMoveInfo.product_default_code[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={stockMoveInfo.product_default_code}
              secondary={this.props.pickingId}
            />
          </ListItem>
          {stockMoveInfo.product_tracking === ProductTracking.none ? (
            <NumberEditor
              label="Print copy"
              value={stockMoveInfo.printing_copy}
              onValidated={value => {
                setStockMoveInfo({ ...stockMoveInfo, printing_copy: value });
              }}
              onValidating={value => value >= 0}
            />
          ) : null}
        </React.Fragment>
      );
    } else return null;
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const { pickingId , stockMoveId} = props;
    if (pickingId !== state.variables.pickingId || stockMoveId !== state.variables.stockMoveId) {
      return { ...state, variables: { ...state.variables, pickingId, stockMoveId } };
    } else return state;
  }

  componentWillReceiveProps(newProps: Props, { variables }: State) {
    if (newProps.stockMoveId !== this.props.stockMoveId) {
      this.props.setStockMoveInfo({
        product_default_code: "",
        picking_number: "",
        schedule_date: null,
        product_tracking: ProductTracking.none,
        printing_copy: 0
      });
      this.props.clearSelected();
      this.setState({
        variables: { ...variables, stockMoveId: newProps.stockMoveId }
      });
    }

    if (newProps.pickingId !== this.props.pickingId) {
      this.setState({
        variables: { ...variables, pickingId: newProps.pickingId }
      });
    }
  }
  componentWillUnmount() {
    this.props.clearSelected();
  }
  setSelectedItem(rowIndex: number, selected: boolean) {
    const { addSelected, removeSelected } = this.props;
    if (selected) addSelected(rowIndex);
    else removeSelected(rowIndex);
  }
  handleOnColumnPropsChanged(
    columns: ReadonlyArray<GridColumn<StockMoveLineType>>
  ) {
    let order = "";
    columns.forEach(column => {
      if (column.sortable && column.sorted) {
        const direction = column.sortDirection === "ASC" ? "" : "desc";
        order = `${column.key} ${direction}`;
      }
    });
    this.setState({ variables: { ...this.state.variables, order }, columns });
  }
  render() {
    const { columns, variables, selectedAll } = this.state;
    const {
      selectedItems,
      setSelected,
      clearSelected,
      setStockMoveLines
    } = this.props;
    const {
      stockMoveId,
      loadingIndicatorClassName,
      rootClassName,
      pickingId,
      setStockMoveInfo
    } = this.props;
    return (
      <ApolloVirtualizedGrid
        checkBoxColumnMode={CheckBoxColumnMode.last}
        setSelectedAll={items => {
          this.setState({ selectedAll: true });
          setSelected(items);
        }}
        setSelectedItems={setSelected}
        clearSelectedAll={() => {
          this.setState({ selectedAll: false });
          clearSelected();
        }}
        selectedAll={selectedAll}
        headerComponent={this.headerComponent}
        rootClassName={rootClassName}
        onDataFetched={data => {
          if (data && data.picking) {
            const { move_lines, product } = data.picking.stock_move;
            this.rowsCount = move_lines.edges.length;
            setStockMoveInfo({
              picking_number: data.picking.name,
              product_default_code: product.default_code,
              schedule_date: new Date(data.picking.scheduled_date),
              product_tracking: product.tracking,
              printing_copy: 0
            });
            setStockMoveLines(move_lines.edges);
          }
        }}
        onRowClick={(rowData, index) => {
          this.setSelectedItem(index, !selectedItems.includes(index));
        }}
        selectedItems={selectedItems}
        listItemRenderer={({
          rowData,
          key,
          style,
          index,
          className,
          onClick
        }) => {
          if (rowData) {
            const { id, lot_name } = rowData;
            return (
              <div style={style} key={key} className={className}>
                <ListItem onClick={onClick}>
                  <ListItemText primary={lot_name ? lot_name : ""} />
                </ListItem>
              </div>
            );
          } else {
            return (
              <div style={style} key={key}>
                <ListItem>
                  <ListItemText
                    primary={
                      <span className={loadingIndicatorClassName}>
                        A....................................
                      </span>
                    }
                  />
                </ListItem>
              </div>
            );
          }
        }}
        listModeBreakPoint={0}
        listItemHeight={46}
        onColumnPropsChanged={this.handleOnColumnPropsChanged.bind(this)}
        columns={columns}
        graphqlQuery={stockMoveLineFindByStockMoveId}
        variables={variables}
        pageSize={20}
        parseListFromQueryResult={(queryResult: any) => {
          return queryResult && queryResult.picking
            ? queryResult.picking.stock_move.move_lines
            : null;
        }}
        updateQuery={(
          previousResult: any,
          list: ApolloListResult<StockMoveLineType>
        ) => {
          setStockMoveLines(list.edges);
          return update(previousResult, {
            picking: {
              stock_move: {
                move_lines: {
                  $set: list
                }
              }
            }
          });
        }}
      />
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    (state: RootState) => ({
      selectedItems: state.stockPicking.selectedStockMoveLine,
      stockMoveInfo: state.stockPicking.labelPrintStatus.stockMoveInfo
    }),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          addSelected: stockPickingActions.addSelectedStockMoveLine,
          removeSelected: stockPickingActions.removeSelectedStockMoveLine,
          clearSelected: stockPickingActions.clearSelectedStockMoveLine,
          setSelected: stockPickingActions.setSelectedStockMoveLine,
          setStockMoveLines: stockPickingActions.setStockMoveLines,
          setStockMoveInfo: stockPickingActions.setStockMoveInfo
        },
        dispatch
      )
  )
)(StockMoveLineGrid);
