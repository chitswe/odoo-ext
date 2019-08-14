import * as React from "react";
import { GridColumn } from "../../component/VirtualizedGrid";
import { StockMoveType } from "./resolvedTypes";
import ApolloVirtualizedGrid, {
  ApolloListResult
} from "../../component/VirtualizedGrid/ApolloVirtualizedGrid";
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  Typography,
  ListItemText,
  ListItemIcon,
  Icon
} from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";
import { stockMoveFindByPickingId } from "./graphql";
import update from "immutability-helper";
import { RouteComponentProps, withRouter } from "react-router";
import { compose } from "react-apollo";
import { Dispatch, bindActionCreators } from "redux";
import { RootState, RootAction } from "../../reducer";
import { siteActions } from "../../reducer/site";
import { connect } from "react-redux";

type State = {
  columns: ReadonlyArray<GridColumn<StockMoveType>>;
  variables: any;
};

type Props = {
  pickingId: number;
  loadingIndicatorClassName: string;
  onStockMoveItemClick?: (stockMove: StockMoveType, index: number) => void;
  selectedItems?: number[];
  scrollToIndex?: number;
  openSnackbar: typeof siteActions.openSnackbar;
  rootClassName?: string;
} & RouteComponentProps;
class StockMoveGrid extends React.Component<Props, State> {
  state: State = {
    columns: [
      {
        label: "id",
        key: "id",
        width: 75,
        labelAlign: "right",
        textAlign: "right",
        hideAt: 1400,
        sortable: true
      },
      {
        label: "Product Code",
        key: "name",
        format: ({ key, rowData }) => rowData.product.default_code,
        width: 200,
        sortable: true
      },
      {
        label: "Product Name",
        key: "product/name",
        width: 200,
        flexGrow: 1,
        format: ({ key, rowData }) => rowData.product.name
      },
      {
        label: "Demand",
        key: "product_uom_qty",
        width: 75,
        labelAlign: "right",
        textAlign: "right",
        sortable: true
      },
      {
        label: "Done",
        key: "quantity_done",
        width: 75,
        labelAlign: "right",
        textAlign: "right",
        sortable: true
      },
      {
        label: "UOM",
        key: "product_uom",
        width: 80,
        format: ({ key, rowData }) => rowData.product_uom.name
      },
      {
        label: " ",
        key: "tracking",
        width: 75,
        format: ({
          key,
          rowData: {
            product: { tracking }
          }
        }) =>
          tracking === "serial" || tracking === "lot" ? (
            <Icon>
              <MenuIcon />
            </Icon>
          ) : null
      }
    ],
    variables: {}
  };

  handleOnColumnPropsChanged(
    columns: ReadonlyArray<GridColumn<StockMoveType>>
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
    const { columns, variables } = this.state;
    const {
      pickingId,
      history,
      match,
      loadingIndicatorClassName,
      onStockMoveItemClick,
      selectedItems,
      scrollToIndex,
      openSnackbar,
      rootClassName
    } = this.props;
    return (
      <ApolloVirtualizedGrid
        debugname="stockmovegrid"
        rootClassName={rootClassName}
        scrollToIndex={scrollToIndex}
        selectedItems={selectedItems}
        onRowClick={(rowData, index) => {
          if (onStockMoveItemClick) onStockMoveItemClick(rowData, index);
        }}
        listItemRenderer={({
          rowData,
          key,
          style,
          index,
          className,
          onClick
        }) => {
          if (rowData) {
            const {
              product,
              product_uom_qty,
              quantity_done,
              product_uom
            } = rowData;
            return (
              <div style={style} key={key} className={className}>
                <ListItem onClick={onClick}>
                  <ListItemAvatar>
                    <Avatar>{product.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={product.default_code}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" color="textPrimary">
                          {product.name}
                        </Typography>
                        {`${quantity_done} / ${product_uom_qty} ${
                          product_uom.name
                        }`}
                      </React.Fragment>
                    }
                  />
                  {product.tracking === "serial" ||
                  product.tracking === "lot" ? (
                    <ListItemIcon>
                      <MenuIcon />
                    </ListItemIcon>
                  ) : null}
                </ListItem>
              </div>
            );
          } else {
            return (
              <div style={style} key={key}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>{}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <span className={loadingIndicatorClassName}>
                        A....................................
                      </span>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          className={loadingIndicatorClassName}
                          color="textPrimary"
                        >
                          A....................................
                        </Typography>
                        <br />
                        <span className={loadingIndicatorClassName}>
                          A.......................................................
                        </span>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </div>
            );
          }
        }}
        listItemHeight={82}
        onColumnPropsChanged={this.handleOnColumnPropsChanged.bind(this)}
        columns={columns}
        graphqlQuery={stockMoveFindByPickingId}
        variables={{ ...variables, id: pickingId }}
        pageSize={20}
        parseListFromQueryResult={(queryResult: any) => {
          return queryResult && queryResult.picking
            ? queryResult.picking.stock_moves
            : null;
        }}
        updateQuery={(
          previousResult: any,
          list: ApolloListResult<StockMoveType>
        ) => {
          return update(previousResult, {
            picking: {
              stock_moves: {
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
  withRouter,
  connect(
    (state: RootState) => ({}),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          openSnackbar: siteActions.openSnackbar
        },
        dispatch
      )
  )
)(StockMoveGrid);
