import * as React from "react";
import { GridColumn } from "../component/VirtualizedGrid";
import { Grid, Typography } from "@material-ui/core";
import ApolloVirtualizedGrid, {
    ApolloListResult
  } from "../component/VirtualizedGrid/ApolloVirtualizedGrid";
import { Theme, withStyles, WithStyles, createStyles } from "@material-ui/core";
import { compose, Query } from "react-apollo";
import { RootState, RootAction } from "../reducer";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import update from "immutability-helper";
import { RouteComponentProps, withRouter } from "react-router";
import * as accounting from "accounting";
import { PriceChangeType } from "./resolvedTypes";
import { priceChangeListQuery } from "./graphql";
import { priceChangeActions } from "../reducer/priceChange";

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
    page: number,
    pageSize: number,
    startDate: Date,
    endDate: Date,
    loadEdit: typeof priceChangeActions.loadEdit,
    setItems: typeof priceChangeActions.setItems,
    addItem: typeof priceChangeActions.addItem
} & RouteComponentProps;

type State = {
    columns: ReadonlyArray<GridColumn<PriceChangeType>>;
    variables: any;
};

class PriceChangeGrid extends React.Component<Props, State> {
    state: State = {
        columns: [
            {
                label: "id",
                key: "id",
                width: 75, 
                labelAlign: "right",
                textAlign: "right",
                hideAt: 1400
            },
            {
                label: "Date",
                key: "PriceChangeDate",
                width: 100,
                labelAlign: "left",
                textAlign: "left",
                format: ({ key, rowData }) => 
                    new Date(rowData.PriceChangeDate).formatAsShortDate(),
                sortable: true,
                hideAt: 600
            },
            {
                label: "Remark",
                key: "Remark",
                width: 250,
                labelAlign: "center",
                textAlign: "left",
                sortable: true,
                hideAt: 600
            },
            {
                label: "CreatedBy",
                key: "createdBy",
                width: 150,
                labelAlign: "center",
                textAlign: "left",
                format: ({ key, rowData }) =>
                    rowData.createdBy ? rowData.createdBy.name : ""                
            },
        ],
        variables: {}
    };

    componentDidMount() {
        let { startDate, endDate, page, pageSize } = this.props;
        this.setState({
            variables: {startDate, endDate, page, pageSize}
          });
    }

    componentWillReceiveProps(newProps: Props) {
        if (newProps.startDate !== this.props.startDate || newProps.endDate !== this.props.endDate) {
          this.setState({
            variables: {startDate: newProps.startDate ? newProps.startDate : "2019-06-01", endDate: newProps.endDate ? newProps.endDate : "2019-07-10", page: newProps.page ? newProps.page : 1, pageSize: newProps.pageSize ? newProps.pageSize : 20 }
          });
        }
    }
  
      handleOnColumnPropsChanged(
        columns: ReadonlyArray<GridColumn<PriceChangeType>>
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
            loadEdit,
            setItems,
            addItem,
            history,
            startDate, endDate, page, pageSize
          } = this.props;

        return (
            <ApolloVirtualizedGrid
                debugname="pricechangegrid"
                rootClassName={rootClassName}
                scrollToIndex={scrollToIndex}
                listItemHeight={82}
                onColumnPropsChanged={this.handleOnColumnPropsChanged.bind(this)}
                columns={columns}
                variables={variables}
                listPropsName="price_change"
                graphqlQuery={priceChangeListQuery}
                onRowClick={( rowData, index) => {
                    const { PriceChangeDate, Remark, createdAt, createdBy, detail } = rowData;
                    let priceChangeDetail = detail.map(({ id, product, PriceBook , OldPrice, NewPrice, Approved }) => ({id, product, PriceBook, OldPrice, NewPrice, Approved, errors: { product: "", PriceBook: "", NewPrice: "" }}));
                    let { name } = createdBy;
                    loadEdit({id: rowData.id, PriceChangeDate, Remark, detail: priceChangeDetail, errors: { PriceChangeDate: "", Remark: ""}});
                    history.push(`/pricechange/detail`);
                }}
                pageSize={20}
                updateQuery={(
                    previousResult: any,
                    list: ApolloListResult<PriceChangeType>
                    ) => {
                    return update(previousResult, {
                        price_change: {
                            $set: list
                        }
                    });
                }}
            />
        );          
    }
}

export default compose(
    connect(
        (state: RootState) => ({
            edit: state.priceChange.edit
        }),
        (dispatch: Dispatch<RootAction>) => 
            bindActionCreators(
                {
                    loadEdit: priceChangeActions.loadEdit,
                    setItems: priceChangeActions.setItems,
                    addItem: priceChangeActions.addItem
                },
                dispatch
            )
    ),
    withRouter,
    withStyles(styles)
)(PriceChangeGrid);