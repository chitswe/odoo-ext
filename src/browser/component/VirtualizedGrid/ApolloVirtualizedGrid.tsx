import * as React from "react";
import VirtualizedGrid, { GridColumn, CheckBoxColumnMode } from ".";
import { Query } from "react-apollo";
import { InfiniteLoader } from "react-virtualized";

export interface ApolloListResult<T> {
  aggegrate: {
    count: number;
  };
  edges: T[];
}

interface Props<T> {
  columns: ReadonlyArray<GridColumn<T>>;
  pageSize?: number;
  graphqlQuery: any;
  variables: any;
  listPropsName?: string;
  parseListFromQueryResult?: (queryResult: any) => ApolloListResult<T>;
  onColumnPropsChanged?: (columns: ReadonlyArray<GridColumn<T>>) => void;
  onRowClick?: (rowData: T, index: number) => void;
  listItemHeight?: number;
  listModeBreakPoint?: number;
  listItemRenderer?: (renderProps: {
    rowData: T;
    key: string;
    style: React.CSSProperties;
    index: number;
    className: string;
    onClick: () => void;
    selected: boolean;
  }) => JSX.Element;
  selectedItems: ReadonlyArray<number>;
  updateQuery?: (previousResult: any, list: ApolloListResult<T>) => any;
  scrollToIndex?: number;
  onDataFetched?: (data: any) => void;
  tableClassName?: string;
  listClassName?: string;
  rootClassName?: string;
  headerComponent?: React.ReactNode;
  checkBoxColumnMode?: CheckBoxColumnMode;
  setSelectedItems?: (items: number[]) => void;
  selectedAll?: boolean;
  setSelectedAll?: (items: number[]) => void;
  clearSelectedAll?: () => void;
  debugname?: string;
}

type State = {
  scrollToIndex: number;
};

class ApolloVirtualizedGrid<T> extends React.Component<Props<T>> {
  static defaultProps: any = {
    pageSize: 20,
    listPropsName: "list"
  };
  state: State = {
    scrollToIndex: -1
  };
  lastFatchedData: any = null;
  loaderCacheResetor: () => void;
  componentDidMount() {
    const { scrollToIndex } = this.props;
    this.setState({ scrollToIndex });
  }
  componentWillReceiveProps({ variables, scrollToIndex }: Props<T>) {
    if (variables !== this.props.variables) {
      this.setState({ scrollToIndex: -1 });
      if (this.loaderCacheResetor) {
        this.loaderCacheResetor();
      }
    }
    if (scrollToIndex !== this.state.scrollToIndex) {
      this.setState({ scrollToIndex });
    }
  }

  render() {
    const {
      graphqlQuery,
      columns,
      pageSize,
      variables,
      listPropsName,
      onColumnPropsChanged,
      onRowClick,
      listItemHeight,
      listItemRenderer,
      listModeBreakPoint,
      parseListFromQueryResult,
      updateQuery,
      selectedItems,
      onDataFetched,
      tableClassName,
      listClassName,
      rootClassName,
      headerComponent,

      checkBoxColumnMode,
      setSelectedItems,
      selectedAll,
      setSelectedAll,
      clearSelectedAll,
      debugname
    } = this.props;
    const { scrollToIndex } = this.state;
    return (
      <Query
        query={graphqlQuery}
        notifyOnNetworkStatusChange={true}
        variables={{ ...variables, pageSize }}
        onCompleted={data => {
          if (onDataFetched && this.lastFatchedData !== data) {
            onDataFetched(data);
          }
          this.lastFatchedData = data;
        }}
      >
        {({ networkStatus, fetchMore, data }) => {
          const parseList = parseListFromQueryResult
            ? parseListFromQueryResult
            : (queryResult: any) => {
                if (queryResult[listPropsName]) {
                  return queryResult[listPropsName];
                } else {
                  return {
                    edges: [],
                    aggregate: {
                      count: 0
                    }
                  };
                }
              };
          let parsedList = parseList(data);
          if (!parsedList)
            parsedList = {
              edges: [],
              aggregate: {
                count: 0
              }
            };
          const {
            aggregate: { count }
          } = parsedList;
          return (
            <VirtualizedGrid
              registerForLoaderCacheReset={(resetor: () => void) => {
                this.loaderCacheResetor = resetor;
              }}
              checkBoxColumnMode={checkBoxColumnMode}
              setSelectedItems={setSelectedAll}
              selectedAll={selectedAll}
              setSelectedAll={setSelectedAll}
              clearSelectedAll={clearSelectedAll}
              headerComponent={headerComponent}
              rootClassName={rootClassName}
              tableClassName={tableClassName}
              listClassName={listClassName}
              loading={
                networkStatus === 1 ||
                networkStatus === 2 ||
                networkStatus === 4
              }
              scrollToIndex={scrollToIndex}
              listItemHeight={listItemHeight}
              listItemRenderer={listItemRenderer}
              listModeBreakPoint={listModeBreakPoint}
              onColumnPropsChanged={onColumnPropsChanged}
              onRowClick={onRowClick}
              selectedItems={selectedItems}
              loadMoreRows={async (page: number) => {
                const moreResult = await fetchMore({
                  variables: { page, pageSize, ...variables },
                  updateQuery: (previousResult, { fetchMoreResult }) => {
                    this.setState({ scrollToIndex: -1 });
                    if (parseListFromQueryResult && !updateQuery) {
                      console.log(
                        "%c updateQuery function must be provided if parseListFromQueryResult function is provided!",
                        "color: red"
                      );
                    }
                    if (!fetchMoreResult) return previousResult;
                    const fetchMoreList = parseList(fetchMoreResult);
                    const previousList = parseList(previousResult);
                    const newList = {
                      ...previousList,
                      edges: [...previousList.edges, ...fetchMoreList.edges]
                    };
                    if (updateQuery)
                      return updateQuery(previousResult, newList);
                    else
                      return {
                        ...previousResult,
                        [listPropsName]: newList
                      };
                  }
                });
                return parseList(moreResult).edges;
              }}
              rowGetter={(index: number) => parsedList.edges[index]}
              totalRowCount={count}
              rowCount={parsedList.edges.length}
              isRowLoaded={(index: number) =>
                parsedList && !!parsedList.edges[index]
              }
              columns={columns}
              pageSize={pageSize}
              initialLoading={networkStatus === 1}
            />
          );
        }}
      </Query>
    );
  }
}

export default ApolloVirtualizedGrid;
