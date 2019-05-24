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
    CircularProgress,
    LinearProgress
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
    });

type Props = WithStyles<typeof styles> & RouteComponentProps;

type State = {
    searchText: string;
    search: string;
};

class SalesOrderList extends React.Component<Props, State> {
    state: State = {
        searchText: "",
        search: ""
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
        this.setState({search: searchText, searchText});
    }
    
    render() {
        const { classes } = this.props;
        const { searchText, search } = this.state; 
        return (
            <Grid container direction="column" className={classes.root}>
                <AppBar position="static" className={classes.appBar}>
                    <Toolbar className={classes.toolBar}>
                        <OpenDrawerButton />
                        <Typography variant="h6" color="inherit" noWrap>
                        Sales Order
                        </Typography>
                        <div className={classes.grow} />

                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                            <SearchIcon />
                            </div>
                            <InputBase
                                placeholder="Search Order"
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
                <SalesOrderGrid search={search}/>
            </Grid>
        );
    }
}

export default compose(
    withStyles(styles)
)(SalesOrderList);