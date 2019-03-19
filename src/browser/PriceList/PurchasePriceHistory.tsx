import * as React from "react";
import ApolloVirtualizedGrid from "../component/VirtualizedGrid/ApolloVirtualizedGrid";
import { GridColumn } from "../component/VirtualizedGrid";
import { OrderLineType } from "./resolvedTypes";
import { purchaseOrderLinesQuery } from "./graphql";
import accounting = require("accounting");

type Props = {
  productId: number;
};
type State = {
  columns: ReadonlyArray<GridColumn<OrderLineType>>;
  variables: any;
};
class PurchasePriceHistory extends React.Component<Props, State> {
  state: State = {
    columns: [
      {
        label: "Date",
        key: "date_planned",
        width: 150,
        format: ({ key, rowData }) =>
          new Date(rowData.date_planned).formatAsShortDate(),
        sortable: true,
        sortDirection: "DESC",
        sorted: true
      },
      {
        label: "#PO",
        key: "order_id",
        width: 100,
        format: ({ rowData }) => rowData.order_id.name,
        sortable: true
      },
      {
        label: "Price",
        key: "price_unit",
        width: 150,
        labelAlign: "right",
        textAlign: "right",
        format: ({ rowData }) => accounting.formatNumber(rowData.price_unit, 0)
      }
    ],
    variables: {
      order: "date_planned DESC"
    }
  };

  handleOnColumnPropsChanged(
    columns: ReadonlyArray<GridColumn<OrderLineType>>
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
    const { productId } = this.props;
    return (
      <ApolloVirtualizedGrid
        listModeBreakPoint={0}
        columns={columns}
        graphqlQuery={purchaseOrderLinesQuery}
        variables={{ ...variables, filter: [[["product_id", "=", productId]]] }}
        listPropsName="purchase_order_lines"
        pageSize={20}
        listItemHeight={82}
        onColumnPropsChanged={this.handleOnColumnPropsChanged.bind(this)}
      />
    );
  }
}

export default PurchasePriceHistory;
