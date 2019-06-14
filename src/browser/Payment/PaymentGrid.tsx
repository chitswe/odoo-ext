import * as React from "react";
import { GridColumn } from "../component/VirtualizedGrid";
import ApolloVirtualizedGrid, {
    ApolloListResult
  } from "../component/VirtualizedGrid/ApolloVirtualizedGrid";
import { paymentListQuery } from "./graphql";
import { Theme, createStyles, WithStyles, withStyles } from "@material-ui/core";
import { compose, Query } from "react-apollo";
import { RootState, RootAction } from "../reducer";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import update from "immutability-helper";
import { RouteComponentProps } from "react-router";
import * as accounting from "accounting";
import { PaymentType } from "./resolvedTypes";

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
    filter: any;
};

type State = {
    columns: ReadonlyArray<GridColumn<PaymentType>>;
    variables: any;
};

class PaymentGrid extends React.Component<Props, State> {
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
              label: "PaymentNumber",
              key: "communication",
              width: 200,
              sortable: true,
              flexGrow: 1,
              format: ({ key, rowData }) => rowData.PaymentNumber
            },
            {
              label: "Date",  
              key: "payment_date",
              width: 150,
              format: ({ key, rowData }) =>
                new Date(rowData.PaymentDate).formatAsShortDate(),
              hideAt: 600,
              sortable: true
            },
            {
                label: "PaymentType",
                key: "payment_type",
                width: 130,
                sortable: true,
                flexGrow: 1,
                format: ({ key, rowData }) => rowData.PaymentType
            },
            {
              label: "Partner",
              key: "partner_id",
              width: 200,
              flexGrow: 1,
              sortable: true,
              format: ({ key, rowData: { partner } }) =>
                partner ? partner.name : ""
            },
            {
                label: "Sales Person",
                key: "create_uid",
                width: 200,
                flexGrow: 1,
                sortable: true,
                format: ({ key, rowData: { createdBy } }) => createdBy ? createdBy.name : ""
            },
            {
              label: "Journal",
              key: "journal_id",
              width: 200,
              flexGrow: 1,
              sortable: true,
              format: ({ key, rowData: { journal } }) => journal ? journal.name : ""
            },
            {
              label: "TotalAmount",
              key: "amount",
              width: 120,
              sortable: true,
              labelAlign: "right",
              textAlign: "right",
              flexGrow: 2,
              hideAt: 700,
              format: ({ key, rowData}) => accounting.formatMoney(rowData.Amount, { format: "%v", precision: accounting.settings.number.precision})
            },
        ],
        variables: {}
    };

    componentWillReceiveProps(newProps: Props) {
        if (newProps.filter !== this.props.filter) {
          this.setState({
            variables: update(this.state.variables, {
              filter: {
                $set: [newProps.filter]
              }
            })
          });
        }
      }

      handleOnColumnPropsChanged(
        columns: ReadonlyArray<GridColumn<PaymentType>>
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
            filter
          } = this.props;

        return (
            <ApolloVirtualizedGrid
                debugname="paymentgrid"
                rootClassName={rootClassName}
                scrollToIndex={scrollToIndex}
                listItemHeight={82}
                onColumnPropsChanged={this.handleOnColumnPropsChanged.bind(this)}
                columns={columns}
                variables={variables}
                listPropsName="payment"
                graphqlQuery={paymentListQuery}
                pageSize={20}
                updateQuery={(
                    previousResult: any,
                    list: ApolloListResult<PaymentType>
                  ) => {
                    return update(previousResult, {
                      payment: {
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
)(PaymentGrid);