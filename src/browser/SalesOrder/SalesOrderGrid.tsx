import * as React from "react";
import { GridColumn } from "../component/VirtualizedGrid";
import ApolloVirtualizedGrid, {
    ApolloListResult
  } from "../component/VirtualizedGrid/ApolloVirtualizedGrid";
import { salesOrderListQuery } from "./graphql";
import { Theme, createStyles, WithStyles, withStyles } from "@material-ui/core";
import { compose, Query } from "react-apollo";
import { RootState, RootAction } from "../reducer";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import update from "immutability-helper";
import { RouteComponentProps } from "react-router";
import { SalesOrdersType, SalesOrderType } from "./resolvedTypes";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flex: 1,
      flexDirection: "column"
    }
  });

type Props = {
    selected: number[];
    selectedIndex: number[];
    scrollToIndex: number;
    rootClassName?: string;
    search: string;
};

type State = {
    columns: ReadonlyArray<GridColumn<SalesOrderType>>;
    variables: any;
};

class SalesOrderGrid extends React.Component<Props, State> {
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
                label: "OrderNumber",
                key: "name",
                width: 200,
                sortable: true,
                flexGrow: 1
              },
              {
                label: "Date",  
                key: "date_order",
                width: 200,
                format: ({ key, rowData }) =>
                  new Date(rowData.date_order).formatAsLongDate(),
                hideAt: 600,
                sortable: true
              },
              {
                label: "Customer Name",
                key: "partner_id",
                width: 250,
                flexGrow: 1,
                sortable: true,
                format: ({ key, rowData: { Customer } }) =>
                  Customer ? Customer.name : ""
              },
              {
                label: "Sales Person",
                key: "user_id",
                width: 250,
                flexGrow: 1,
                sortable: true,
                format: ({ key, rowData: { SalesPerson } }) => SalesPerson ? SalesPerson.name : ""
              },
              {
                label: "TotalAmount",
                key: "amount_total",
                width: 150,
                sortable: true,
                labelAlign: "center",
                flexGrow: 2,
                hideAt: 700
              },
              {
                label: "AmountDue",
                key: "AmountDue",
                width: 150,
                sortable: true,
                labelAlign: "center",
                flexGrow: 2,
                hideAt: 700
              },              
        ],
        variables: {
        }
    };

    componentWillReceiveProps(newProps: Props) {
      if (newProps.search !== this.props.search) {
        const filter = newProps.search
          ? [
              [
                ["name", "ilike", newProps.search]
              ]
            ]
          : [[]];
        this.setState({
          variables: update(this.state.variables, {
            filter: {
              $set: filter
            }
          })
        });
      }
    }

    handleOnColumnPropsChanged(
      columns: ReadonlyArray<GridColumn<SalesOrderType>>
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
            scrollToIndex,
            selectedIndex,
            rootClassName,
            search
          } = this.props;

        return (
            <ApolloVirtualizedGrid
                debugname="salesordergrid"
                rootClassName={rootClassName}
                scrollToIndex={scrollToIndex}
                listItemHeight={82}
                onColumnPropsChanged={this.handleOnColumnPropsChanged.bind(this)}
                columns={columns}
                variables={variables}
                listPropsName="sales_order"
                graphqlQuery={salesOrderListQuery}
                pageSize={20}
                updateQuery={(
                    previousResult: any,
                    list: ApolloListResult<SalesOrderType>
                  ) => {
                    return update(previousResult, {
                      sales_order: {
                          $set: list
                      }
                    });
                  }}
            />
        );
    }
}

export default compose(
    withStyles(styles)
)(SalesOrderGrid);