import * as React from "react";
import { GridColumn } from "../component/VirtualizedGrid";
import { ProductType, MasterPriceList } from "./resolvedTypes";
import ApolloVirtualizedGrid from "../component/VirtualizedGrid/ApolloVirtualizedGrid";
import { productsPriceListQuery, getMasterPriceListQuery } from "./graphql";
import { Theme, createStyles, WithStyles, withStyles } from "@material-ui/core";
import { compose, Query } from "react-apollo";
import { RootState, RootAction } from "../reducer";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { priceListActions } from "../reducer/priceList";
import update from "immutability-helper";
import PriceListSelect from "./PriceListSelect";
import { RouteComponentProps } from "react-router";
const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flex: 1,
      flexDirection: "column"
    }
  });

type Props = {
  masterPriceList: { [id: number]: MasterPriceList };
  setMasterPriceList: typeof priceListActions.setMasterPriceList;
  selected: number[];
  selectedIndex: number[];
  priceListItemClick: (rowData: ProductType, index: number) => void;
  scrollToIndex: number;
  rootClassName?: string;
  search: string;
} & WithStyles<typeof styles> &
  RouteComponentProps;

type State = {
  columns: ReadonlyArray<GridColumn<ProductType>>;
  variables: any;
};
class PriceListGrid extends React.Component<Props, State> {
  masterPriceLists: MasterPriceList[];
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
        label: "Code",
        key: "default_code",
        width: 250,
        sortable: true,
        flexGrow: 1
      },
      {
        label: "Name",
        key: "name",
        width: 300,
        sortable: true,
        flexGrow: 2,
        hideAt: 700
      },
      {
        label: "Public",
        key: "public",
        width: 100,
        labelAlign: "right",
        textAlign: "right",
        format: ({ key, rowData: { priceLists } }) => {
          return priceLists[0].price;
        }
      }
    ],
    variables: {
      priceListIds: [1]
    }
  };

  componentWillReceiveProps(newProps: Props) {
    if (newProps.selected !== this.props.selected) {
      const masterPriceList = newProps.masterPriceList;
      const priceColumns = newProps.selected.map((id, index) => {
        const column: GridColumn<ProductType> = {
          label: id === 1 ? "Public" : masterPriceList[id].name,
          key: masterPriceList[id].name,
          width: 100,
          labelAlign: "right",
          textAlign: "right",
          format: ({ key, rowData: { priceLists } }) => {
            return priceLists[index].price;
          }
        };
        return column;
      });
      const c = this.state.columns.length - 3;
      let newColumns = update(this.state.columns, {
        $splice: [[3, c]]
      });
      newColumns = update(newColumns, {
        $push: priceColumns
      });
      this.setState({
        columns: newColumns,
        variables: update(this.state.variables, {
          priceListIds: {
            $set: newProps.selected
          }
        })
      });
    }
    if (newProps.search !== this.props.search) {
      const filter = newProps.search
        ? [[["default_code", "ilike", newProps.search]]]
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

  render() {
    const { columns, variables } = this.state;
    const {
      classes,
      setMasterPriceList,
      priceListItemClick,
      scrollToIndex,
      selectedIndex,
      rootClassName,
      search
    } = this.props;
    return (
      <Query
        query={getMasterPriceListQuery}
        ssr={false}
        onCompleted={data => {
          if (
            data &&
            data.pricelists &&
            this.masterPriceLists !== data.pricelists.edges
          ) {
            this.masterPriceLists = data.pricelists.edges;
            setMasterPriceList(data.pricelists.edges);
          }
        }}
      >
        {({ data }) => (
          <div className={`${classes.root} ${rootClassName}`}>
            <PriceListSelect
              priceLists={data.pricelists && data.pricelists.edges}
            />
            <ApolloVirtualizedGrid
              selectedItems={selectedIndex}
              listModeBreakPoint={0}
              scrollToIndex={scrollToIndex}
              columns={columns}
              graphqlQuery={productsPriceListQuery}
              variables={variables}
              listPropsName="products"
              pageSize={20}
              listItemHeight={82}
              onRowClick={priceListItemClick}
            />
          </div>
        )}
      </Query>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    (state: RootState) => {
      return {
        masterPriceList: state.priceList.master,
        selected: state.priceList.selected
      };
    },
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          setMasterPriceList: priceListActions.setMasterPriceList
        },
        dispatch
      )
  )
)(PriceListGrid);
