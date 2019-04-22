import * as React from "react";
import MediaQuery from "../../common/MediaQuery";
import { Switch, Route, RouteComponentProps } from "react-router";
import {
  Grid,
  Theme,
  createStyles,
  WithStyles,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  withStyles,
  InputBase,
  CircularProgress,
  LinearProgress
} from "@material-ui/core";
import OpenDrawerButton from "../component/AppBar/OpenDrawerButton";
import { FaFileCsv } from "react-icons/fa";
import PriceListGrid from "./PriceListGrid";
import { compose, ApolloConsumer } from "react-apollo";
import { connect } from "react-redux";
import { RootState, RootAction } from "../reducer";
import { Dispatch } from "redux";
import { ProductType, MasterPriceList } from "./resolvedTypes";
import PriceListInfoTab from "./PriceListInfoTab";
import SearchIcon from "@material-ui/icons/Search";
import { fade } from "@material-ui/core/styles/colorManipulator";
import ApolloClient from "apollo-client";
import { productsPriceListQuery as Query } from "./graphql";
import { productPriceListQuery, productPriceListQueryVariables } from "./types";

const styles = (theme: Theme) =>
  createStyles({
    grow: { flexGrow: 1 },
    appBar: {
      color: "#fff",
      zIndex: 1100
    },
    root: {},
    fill: {
      flex: 1
    },
    row: {
      flex: 1,
      flexWrap: "nowrap"
    },
    loadingIndicator: {
      backgroundColor: "#DDDDDD",
      color: "#DDDDDD",
      width: 150,
      display: "inline"
    },
    fillBackground: {
      backgroundColor: theme.palette.grey[100],
      zIndex: 500,
      marginTop: theme.spacing.unit
    },
    stockMoveGridLine: {
      width: 500
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20
    },
    toolBar: {
      [theme.breakpoints.up("md")]: {
        minHeight: 48
      }
    },
    search: {
      position: "relative",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      "&:hover": {
        backgroundColor: fade(theme.palette.common.white, 0.25)
      },
      marginLeft: 0,
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing.unit,
        width: "auto"
      }
    },
    searchIcon: {
      width: theme.spacing.unit * 9,
      height: "100%",
      position: "absolute",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    inputRoot: {
      color: "inherit",
      width: "100%"
    },
    inputInput: {
      paddingTop: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
      paddingBottom: theme.spacing.unit,
      paddingLeft: theme.spacing.unit * 10,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        width: 200,
        "&:focus": {
          width: 250
        }
      }
    },
    backDrop: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      backgroundColor: "rgba(0,0,0,.5)",
      zIndex: 1000
    },
    progress: {
      position: "absolute",
      width: 300,
      zIndex: 1001,
      height: 64,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: "auto",
      backgroundColor: "#fff",
      paddingTop: 20,
      paddingLeft: 16,
      paddingRight: 16
    }
  });

type Props = WithStyles<typeof styles> &
  RouteComponentProps & {
    isPriceEdited: boolean;
    masterPriceList: { [id: number]: MasterPriceList };
  };

type State = {
  selectedId: number;
  selectedIndex: number;
  searchText: string;
  search: string;
  downloadProgress: number;
  downloading: boolean;
  page: number;
  totalPage: number;
};

class PriceList extends React.Component<Props, State> {
  state: State = {
    selectedId: null,
    selectedIndex: -1,
    searchText: "",
    search: "",
    downloadProgress: 0,
    downloading: false,
    page: 0,
    totalPage: 0
  };
  renderAppBar(appBarType: "price_list" | "price_list_details" | "both") {
    const { classes } = this.props;
    const { searchText, downloading } = this.state;
    return (
      <AppBar className={classes.appBar} position="static">
        <Toolbar className={classes.toolBar}>
          <OpenDrawerButton />
          <Typography variant="h6" color="inherit" noWrap>
            {appBarType === "price_list" || appBarType === "both"
              ? "Price List"
              : "Price List Edit"}
          </Typography>
          <div className={classes.grow} />

          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search product"
              value={searchText}
              onChange={e => {
                this.setState({ searchText: e.target.value });
              }}
              onKeyPress={event => {
                if (event.key === "Enter") {
                  this.setState({ search: searchText });
                }
              }}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput
              }}
            />
          </div>
          <ApolloConsumer>
            {client => (
              <IconButton
                disabled={downloading}
                aria-label="Download CSV"
                color="inherit"
                onClick={() => {
                  const { masterPriceList } = this.props;
                  const priceListIds = Object.values(masterPriceList).map(
                    p => p.id
                  );
                  let csv =
                    "data:text/csv;charset=utf-8," +
                    "id,code,name," +
                    Object.values(masterPriceList)
                      .map(p => p.name)
                      .join(",") +
                    "\r\n";
                  this.setState({ downloading: true, downloadProgress: 0 });
                  this.downloadForCSV(client, csv, priceListIds);
                }}
              >
                <FaFileCsv />
              </IconButton>
            )}
          </ApolloConsumer>
        </Toolbar>
      </AppBar>
    );
  }

  async downloadForCSV(
    client: ApolloClient<any>,
    csv: string,
    priceListIds: number[],
    page: number = 1
  ) {
    const newLine = "\r\n";
    const pageSize = 10;
    const { search } = this.state;
    const filter: any = search
      ? [["|", ["default_code", "ilike", search], ["name", "ilike", search]]]
      : [[]];
    const queryResult = await client.query<
      productPriceListQuery,
      productPriceListQueryVariables
    >({
      query: Query,
      variables: {
        page,
        pageSize,
        filter,
        priceListIds
      }
    });
    if (queryResult.data && queryResult.data.products) {
      const {
        products: {
          edges,
          aggregate: { count },
          pageInfo: { hasMore }
        }
      } = queryResult.data;
      const totalPage = Math.ceil(count / pageSize);
      this.setState({
        downloadProgress: (page / totalPage) * 100,
        page,
        totalPage
      });
      edges.forEach(p => {
        csv += p.id + ",";
        csv += p.default_code + ",";
        csv += p.name;
        p.priceLists.forEach(price => {
          csv += "," + price.price;
        });
        csv += newLine;
      });

      if (hasMore) {
        this.downloadForCSV(client, csv, priceListIds, page + 1);
      } else {
        this.setState({ downloading: false });
        var encodedUri = encodeURI(csv);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "product_price.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  renderProgress() {
    const { page, totalPage, downloadProgress } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.backDrop}>
        <div className={classes.progress}>
          <LinearProgress
            value={downloadProgress}
            variant={page === 0 ? "indeterminate" : "determinate"}
          />
          <Typography>
            {page} / {totalPage}
          </Typography>
        </div>
      </div>
    );
  }

  render() {
    const { classes, history } = this.props;
    const { selectedIndex, selectedId, search, downloading } = this.state;
    const selected: number[] =
      selectedIndex || selectedIndex === 0 ? [selectedIndex] : [];
    return (
      <React.Fragment>
        {downloading ? this.renderProgress() : null}
        <MediaQuery maxWidth={959}>
          <Switch>
            <Route
              exact
              path={"/price"}
              render={routeComponentProps => (
                <Grid container direction="column" className={classes.root}>
                  {this.renderAppBar("price_list")}
                  <PriceListGrid
                    search={search}
                    rootClassName={classes.fillBackground}
                    selectedIndex={selected}
                    scrollToIndex={selectedIndex}
                    priceListItemClick={(
                      rowData: ProductType,
                      index: number
                    ) => {
                      this.setState({
                        selectedId: rowData.id,
                        selectedIndex: index
                      });
                      history.push(`/price/${rowData.id}`);
                    }}
                  />
                </Grid>
              )}
            />
            <Route
              path={`/price/:productId`}
              render={routeComponentProps => (
                <Grid container direction="column" className={classes.root}>
                  {this.renderAppBar("price_list_details")}
                  <PriceListInfoTab
                    productId={Number.parseInt(
                      routeComponentProps.match.params.productId,
                      10
                    )}
                  />
                </Grid>
              )}
            />
          </Switch>
        </MediaQuery>
        <MediaQuery minWidth={960}>
          <Grid container direction="column" className={classes.root}>
            {this.renderAppBar("both")}
            <Grid
              container
              item
              className={classes.row}
              direction="row"
              spacing={16}
            >
              <Grid container direction="row" item xs={12}>
                <PriceListGrid
                  search={search}
                  rootClassName={classes.fillBackground}
                  scrollToIndex={selectedIndex}
                  selectedIndex={selected}
                  priceListItemClick={(rowData: ProductType, index: number) => {
                    this.setState({
                      selectedId: rowData.id,
                      selectedIndex: index
                    });
                  }}
                />
              </Grid>

              <Switch>
                <Route
                  path={`/price/:productId`}
                  render={routeComponentProps => (
                    <Grid
                      container
                      direction="row"
                      item
                      className={classes.stockMoveGridLine}
                    >
                      <PriceListInfoTab
                        productId={
                          selectedId
                            ? selectedId
                            : Number.parseInt(
                                routeComponentProps.match.params.productId,
                                10
                              )
                        }
                      />
                    </Grid>
                  )}
                />
                <Route
                  path={`/price`}
                  render={routeComponentProps => {
                    if (selectedId)
                      return (
                        <Grid
                          container
                          direction="row"
                          item
                          className={classes.stockMoveGridLine}
                        >
                          <PriceListInfoTab productId={selectedId} />
                        </Grid>
                      );
                    else return null;
                  }}
                />
              </Switch>
            </Grid>
          </Grid>
        </MediaQuery>
      </React.Fragment>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    (state: RootState) => ({
      masterPriceList: state.priceList.master,
      isPriceEdited: state.priceList.edited
    }),
    (dispatch: Dispatch<RootAction>) => ({})
  )
)(PriceList);
