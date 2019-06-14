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
import { stockPickingActions } from "../../reducer/stockPicking";
import { Dispatch, bindActionCreators } from "redux";
import { FaCheckCircle } from "react-icons/fa";
import { compose, Mutation } from "react-apollo";
import { changeProductLotMutation } from "./graphql";

type State = {
  columns: ReadonlyArray<GridColumn<StockMoveLineType>>;
  variables: any;
  selectedProductCode?: string;
  selectedAll: boolean;
};

type Props = WithStyles<typeof styles> & {
  sotckMoveId: number;
  pickingId: number;
  loadingIndicatorClassName: string;
  rootClassName?: string;
  selectedItems: ReadonlyArray<number>;
  setSelected: typeof stockPickingActions.setSelectedStockMoveLine;
  clearSelected: typeof stockPickingActions.clearSelectedStockMoveLine;
  addSelected: typeof stockPickingActions.addSelectedStockMoveLine;
  removeSelected: typeof stockPickingActions.removeSelectedStockMoveLine;
};

const styles = (theme: Theme) => 
  createStyles({
    created: {
      color: "primary"
    },
    normal: {
      color : "inherit"
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
      {
        label: "Qty",
        key: "quant",
        flexGrow: 1,
        width: 50,
        sortable: false,
        format: ({ key, rowData: { quant } }) =>		
          quant ? quant.quantity : ""
      },
      {
        label: "Serial No",
        key: "lot_name",
        flexGrow: 1,
        width: 200,
        sortable: false,
        format: ({ key, rowData: { id, lot_name, product_lot } }) =>	
          (            
            <Mutation
              mutation={changeProductLotMutation}
              key={id}
            >
              {(
                changeProductLot,
                { loading: saving, error: saveError }
              ) =>  {
                  const { classes, pickingId } = this.props;
                  return <TextEditor
                            onValidated={(value, oldValue) => {
                              if (value !== oldValue)
                                changeProductLot({
                                  variables: {
                                    id,
                                    pickingId,
                                    lotname: value
                                  }
                                });
                            }}
                            retainFocusOnError={true}
                            error={!!saveError}
                            helperText={
                              saveError ? "Could not saved!" : ""
                            }
                            label=""
                            value={lot_name ? lot_name : ""}                    
                            className={product_lot && product_lot.created ? classes.created : classes.normal}
                            // onChanged={value => {
                            //   setEdit(value);
                            // }}
                       />;
                  }
              }
            </Mutation>
          )          
      }
    ],
    variables: {}
  };
  get headerComponent() {
    const { selectedProductCode } = this.state;
    if (selectedProductCode) {
      return (
        <ListItem>
          <ListItemAvatar>
            <Avatar>{selectedProductCode[0]}</Avatar>
          </ListItemAvatar>
          <ListItemText primary={selectedProductCode} />
        </ListItem>
      );
    } else return null;
  }

  componentWillReceiveProps(newProps: Props, state: State) {
    if (newProps.sotckMoveId !== this.props.sotckMoveId) {
      this.setState({ selectedProductCode: "", selectedAll: false });
      this.props.clearSelected();
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
    const { selectedItems, setSelected, clearSelected } = this.props;
    const {
      sotckMoveId,
      loadingIndicatorClassName,
      rootClassName
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
          if (data && data.stock_move) {
            const { move_lines, product } = data.stock_move;
            this.rowsCount = move_lines.edges.length;
            this.setState({
              selectedProductCode: product ? product.default_code : ""
            });
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
        variables={{ ...variables, id: sotckMoveId }}
        pageSize={20}
        parseListFromQueryResult={(queryResult: any) => {
          return queryResult && queryResult.stock_move
            ? queryResult.stock_move.move_lines
            : null;
        }}
        updateQuery={(
          previousResult: any,
          list: ApolloListResult<StockMoveLineType>
        ) => {
          return update(previousResult, {
            stock_move: {
              move_lines: {
                $set: list
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
    selectedItems: state.stockPicking.selectedStockMoveLine
  }),
  (dispatch: Dispatch<RootAction>) =>
    bindActionCreators(
      {
        addSelected: stockPickingActions.addSelectedStockMoveLine,
        removeSelected: stockPickingActions.removeSelectedStockMoveLine,
        clearSelected: stockPickingActions.clearSelectedStockMoveLine,
        setSelected: stockPickingActions.setSelectedStockMoveLine
      },
      dispatch
    )
  )
)(StockMoveLineGrid);
