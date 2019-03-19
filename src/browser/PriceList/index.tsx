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
  InputBase
} from "@material-ui/core";
import OpenDrawerButton from "../component/AppBar/OpenDrawerButton";
import { FaBarcode } from "react-icons/fa";
import PriceListGrid from "./PriceListGrid";
import { compose } from "react-apollo";
import { connect } from "react-redux";
import { RootState, RootAction } from "../reducer";
import { Dispatch } from "redux";
import { ProductType } from "./resolvedTypes";
import PriceListInfoTab from "./PriceListInfoTab";
import SearchIcon from "@material-ui/icons/Search";
import { fade } from "@material-ui/core/styles/colorManipulator";

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
    }
  });

type Props = WithStyles<typeof styles> &
  RouteComponentProps & {
    isPriceEdited: boolean;
  };

type State = {
  selectedId: number;
  selectedIndex: number;
  searchText: string;
  search: string;
};

class PriceList extends React.Component<Props, State> {
  state: State = {
    selectedId: null,
    selectedIndex: -1,
    searchText: "",
    search: ""
  };
  renderAppBar(appBarType: "price_list" | "price_list_details" | "both") {
    const { classes, isPriceEdited } = this.props;
    const { searchText, search } = this.state;
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
        </Toolbar>
      </AppBar>
    );
  }
  render() {
    const { classes, history } = this.props;
    const { selectedIndex, selectedId, search } = this.state;
    const selected: number[] =
      selectedIndex || selectedIndex === 0 ? [selectedIndex] : [];
    return (
      <React.Fragment>
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
      isPriceEdited: state.priceList.edited
    }),
    (dispatch: Dispatch<RootAction>) => ({})
  )
)(PriceList);
