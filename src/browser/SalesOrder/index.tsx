import * as React from "react";
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
    Button,
    CircularProgress,
    LinearProgress,
    TextField,
    Drawer
  } from "@material-ui/core";
import OpenDrawerButton from "../component/AppBar/OpenDrawerButton";
import SearchIcon from "@material-ui/icons/Search";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { compose, ApolloConsumer } from "react-apollo";
import { connect } from "react-redux";
import { RootState, RootAction } from "../reducer";
import { Dispatch } from "redux";
import SalesOrderGrid from "./SalesOrderGrid";
import * as qs from "query-string";

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
        a: {
            width: 250
        },
        bg: {
            display: "flex",
            paddingTop: 32,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        },
        dateField: {
            width: 200,
            height: 50,
            marginTop: theme.spacing.unit * 3,
            marginBottom: theme.spacing.unit * 2
        },
        textField: {
            width: 200,
            marginTop: theme.spacing.unit * 3,
            marginBottom: theme.spacing.unit * 2
        },
        loadingIndicator: {
            backgroundColor: "#DDDDDD",
            color: "#DDDDDD",
            width: 150,
            display: "inline"
        },
        toolBar: {
            [theme.breakpoints.up("md")]: {
              minHeight: 48
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
    });

type Props = WithStyles<typeof styles> & RouteComponentProps;

type State = {
    open: boolean;
    searchOrderNo: string;
    fromDate: string;
    toDate: string;
    filter: any;
};

class SalesOrderList extends React.Component<Props, State> {
    state: State = {
        searchOrderNo: "",
        open: false,
        fromDate: "",
        toDate: "",
        filter: []
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
        const searchText = parsed.search ? parsed.search.toString() : "";
        this.setState({searchOrderNo: searchText});
    }
    
    render() {
        const { classes } = this.props;
        const { searchOrderNo, filter, open, fromDate, toDate } = this.state; 
        return (
            <Grid container direction="column" className={classes.root}>
            <Drawer open={open} onClose={() => {this.setState({open: false}); }} >
                <div
                    tabIndex={0}
                    role="button"
                    
                >
                    <div className={classes.a}>
                        <div className={classes.bg}>
                            <Typography variant="h6" color="inherit" noWrap>
                                Filter
                            </Typography>
                            <TextField
                                id="orderNo"
                                label="Search OrderNo"
                                className={classes.textField}
                                value={searchOrderNo}
                                onChange={(e) => {
                                    this.setState(({searchOrderNo: e.target.value}));
                                }}
                            />
                            <TextField
                                id="datefrom"
                                label="From"
                                className={classes.textField}
                                type="date"
                                value={fromDate}
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) => {
                                    this.setState(({fromDate: e.target.value}));
                                }}
                            />
                            <TextField
                                id="dateTo"
                                label="To"
                                className={classes.textField}
                                type="date"
                                value={toDate}
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) => {
                                    this.setState(({toDate: e.target.value}));
                                }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    const searchFilter = [];
                                    if (searchOrderNo)
                                        searchFilter.push(["name", "ilike", searchOrderNo]);
                                    if (fromDate)
                                        searchFilter.push(["date_order", ">=", fromDate]);
                                    if (toDate)
                                        searchFilter.push(["date_order", "<=", toDate]);
                                    
                                    this.setState({filter: searchFilter});
                                }}
                            >
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
                </Drawer>
                <AppBar position="static" className={classes.appBar}>
                    <Toolbar className={classes.toolBar}>
                        <OpenDrawerButton />
                        <Typography variant="h6" color="inherit" noWrap>
                        Sales Order
                        </Typography>
                        <div className={classes.grow} />
                        <IconButton 
                                color="inherit"
                                onClick={() => {
                                    this.setState({open: !open});
                                }}
                        >
                            <SearchIcon />
                        </IconButton>
                    </Toolbar>                    
                </AppBar>
                <SalesOrderGrid filter={filter}/>
            </Grid>
        );
    }
}

export default compose(
    withStyles(styles)
)(SalesOrderList);