import * as React from "react";
import { stockPickingFindAllQuery } from "./graphql";
import { StockPickingType } from "./resolvedTypes";
import * as qs from "query-string";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
  Divider,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  InputBase
} from "@material-ui/core";
import ApolloVirtualizedGrid from "../../component/VirtualizedGrid/ApolloVirtualizedGrid";
import { GridColumn } from "../../component/VirtualizedGrid";
import { RouteComponentProps } from "react-router";
import update from "immutability-helper";
import { compose } from "react-apollo";
import { connect } from "react-redux";
import { RootState, RootAction } from "../../reducer";
import { Dispatch, bindActionCreators } from "redux";
import { stockPickingActions } from "../../reducer/stockPicking";
import { stockMoveActions } from "../../reducer/stockMove";
import OpenDrawerButton from "../../component/AppBar/OpenDrawerButton";
import SearchIcon from "@material-ui/icons/Search";
import ClearAll from "@material-ui/icons/ClearAllOutlined";
import { fade } from "@material-ui/core/styles/colorManipulator";
const styles = (theme: Theme) =>
  createStyles({
    root: {
    },
    loadingIndicator: {
      backgroundColor: "#DDDDDD",
      color: "#DDDDDD",
      width: 150,
      display: "inline"
    },
    appBar: {
      color: "#fff"
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
    grow: {
      flexGrow: 1
    }
  });

type ReduxProps = {
  selectedIndex?: number;
  selectedPicking?: StockPickingType;
  setSelectedStockPicking: typeof stockPickingActions.setSelectedPicking;
};

type Props = {} & RouteComponentProps & WithStyles<typeof styles> & ReduxProps;

type State = {
  columns: ReadonlyArray<GridColumn<StockPickingType>>;
  variables: any;
  search: string;
};

class StockPickings extends React.Component<Props, State> {
  state: State = {
    search: "",
    variables: {},
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
        label: "Name",
        key: "name",
        width: 150,
        flexGrow: 1,
        sortable: true
      },
      {
        label: "Date",
        key: "scheduled_date",
        width: 200,
        format: ({ key, rowData }) =>
          new Date(rowData.scheduled_date).formatAsLongDate(),
        hideAt: 600,
        sortable: true
      },
      {
        label: "From",
        key: "location_id",
        width: 200,
        format: ({
          key,
          rowData: {
            location: { name = "" }
          }
        }) => name,
        flexGrow: 1,
        hideAt: 1000,
        sortable: true
      },
      {
        label: "To",
        key: "location_dest_id",
        width: 200,
        format: ({ key, rowData: { location_dest } }) =>
          location_dest ? location_dest.name : "",
        flexGrow: 1,
        hideAt: 800,
        sortable: true
      },
      {
        label: "Partner",
        key: "partner_id",
        width: 200,
        format: ({ key, rowData: { partner } }) =>
          partner ? partner.name : "",
        flexGrow: 1,
        hideAt: 1200,
        sortable: true
      },
      {
        label: "Operation Type",
        key: "picking_type_id",
        width: 200,
        format: ({ key, rowData }) => rowData.picking_type.name,
        flexGrow: 1,
        sortable: true
      },
      {
        label: "Status",
        key: "state",
        width: 150,
        sortable: true
      }
    ]
  };

  componentDidMount() {
    if (this.props.location.search)
      this.populateStateFromQueryString(this.props.location.search);
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.location.search !== newProps.location.search) {
      this.populateStateFromQueryString(newProps.location.search);
    }
  }

  populateStateFromQueryString(query: string) {
    const parsed = qs.parse(query);
    const { columns } = this.state;
    const newColumns: GridColumn<StockPickingType>[] = [];
    const [field, direction] = parsed.order
      ? (parsed.order as string).split(" ")
      : ["", ""];
    columns.forEach(column => {
      const sorted = column.key === field;
      const sortDirection = sorted
        ? direction === "desc"
          ? "DESC"
          : "ASC"
        : "";
      newColumns.push(Object.assign({}, column, { sorted, sortDirection }));
    });
    const searchText = parsed.search ? parsed.search.toString() : "";
    const filter = parsed.search ? [[["name", "ilike", searchText]]] : [[]];
    const newState = update(this.state, {
      search: {
        $set: searchText
      },
      columns: {
        $set: newColumns
      },
      variables: {
        order: {
          $set: parsed.order
        },
        filter: {
          $set: filter
        },
        search: {
          $set: searchText
        }
      }
    });
    this.setState(newState);
  }

  handleOnColumnPropsChanged(
    columns: ReadonlyArray<GridColumn<StockPickingType>>
  ) {
    const { history, match } = this.props;
    let order = "";
    columns.forEach(column => {
      if (column.sortable && column.sorted) {
        const direction = column.sortDirection === "ASC" ? "" : "desc";
        order = `${column.key} ${direction}`;
      }
    });
    if (order !== this.state.variables.order) {
      history.push(`${match.url}?${this.strigifyQueryString({ order })}`);
    }
  }

  parseQueryObject() {
    const { location } = this.props;
    return qs.parse(location.search);
  }

  strigifyQueryString(params: { search?: string; order?: string }) {
    const parsed = this.parseQueryObject();
    return qs.stringify({ ...parsed, ...params });
  }

  render() {
    const {
      classes,
      history,
      setSelectedStockPicking,
      selectedIndex,
      match
    } = this.props;
    const { columns, variables, search } = this.state;
    return (
      <Grid container direction="column" className={classes.root}>
        <AppBar position="static" className={classes.appBar}>
          <Toolbar className={classes.toolBar}>
            <OpenDrawerButton />
            <Typography variant="h6" color="inherit" noWrap>
              Pickings
            </Typography>
            <div className={classes.grow} />
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Enter Picking No"
                value={search}
                onChange={e => {
                  this.setState({ search: e.target.value });
                }}
                onKeyPress={event => {
                  if (event.key === "Enter") {
                    history.push(
                      `${match.url}?${this.strigifyQueryString({
                        search
                      })}`
                    );
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
        <ApolloVirtualizedGrid
          listItemRenderer={({
            rowData,
            key,
            style,
            index,
            className,
            onClick
          }) => {
            if (rowData) {
              const { name, scheduled_date, picking_type, id } = rowData;
              return (
                <div style={style} key={key} className={className}>
                  <ListItem onClick={onClick}>
                    <ListItemAvatar>
                      <Avatar>{name[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={name}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" color="textPrimary">
                            {new Date(scheduled_date).formatAsLongDate()}
                          </Typography>
                          {picking_type.name}
                        </React.Fragment>
                      }
                    />
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
                        <span className={classes.loadingIndicator}>
                          A....................................
                        </span>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            className={classes.loadingIndicator}
                            component="span"
                            color="textPrimary"
                          >
                            A....................................
                          </Typography>
                          <br />
                          <span className={classes.loadingIndicator}>
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
          scrollToIndex={selectedIndex}
          selectedItems={
            selectedIndex || selectedIndex === 0 ? [selectedIndex] : []
          }
          onColumnPropsChanged={this.handleOnColumnPropsChanged.bind(this)}
          columns={columns}
          graphqlQuery={stockPickingFindAllQuery}
          variables={variables}
          onRowClick={(data, index) => {
            setSelectedStockPicking({ index, data });
            history.push(`/inventory/picking/${data.id}`);
          }}
          listPropsName="pickings"
          pageSize={20}
          listItemHeight={82}
        />
      </Grid>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    ({ stockPicking: { selectedPicking } }: RootState) => ({
      selectedIndex: selectedPicking.index,
      selectedPicking: selectedPicking.data
    }),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        { 
          setSelectedStockPicking: stockPickingActions.setSelectedPicking
        },
        dispatch
      )
  )
)(StockPickings);
