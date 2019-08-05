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
    LinearProgress,
    Drawer,
    TextField,
    Button
  } from "@material-ui/core";
import OpenDrawerButton from "../component/AppBar/OpenDrawerButton";
import { compose, ApolloConsumer } from "react-apollo";
import { connect } from "react-redux";
import { RootState, RootAction } from "../reducer";
import { Dispatch } from "redux";
import update from "immutability-helper";
import { FaSearch, FaEdit } from "react-icons/fa";
import PriceChangeGrid from "./PriceChangeGrid";

const styles = (theme: Theme) =>
  createStyles({
    grow: { flexGrow: 1 },
    appBar: {
        color: "#fff",
        zIndex: 1100
    },
    toolBar: {
        [theme.breakpoints.up("md")]: {
          minHeight: 48
        }
    },
    root: {},
    fill: {
        flex: 1
    },
    row: {
        flex: 1,
        flexWrap: "nowrap"
    },
  });

type Props = WithStyles<typeof styles> & RouteComponentProps;

type State = {
    searchText: string;
    search: string;
    open: boolean;
};

class PriceChange extends React.Component< Props, State> {
    state: State = {
        search: "",
        searchText: "",
        open: false
    };

    render () {
        const { classes, history } = this.props;
        const { search, searchText, open} = this.state;

        return (
            <Grid container direction="column" className={classes.root}>
                <AppBar position="static" className={classes.appBar} >
                    <Toolbar className={classes.toolBar}>
                    <OpenDrawerButton />
                            <Typography variant="h6" color="inherit" noWrap>
                                Price Changes
                            </Typography>
                            <div className={classes.grow} />
                            <IconButton 
                                color="inherit"
                                onClick={() => {
                                    history.push(`/pricechange/detail`);
                                }}
                            >
                                <FaEdit />
                            </IconButton>
                    </Toolbar>
                </AppBar>
                <PriceChangeGrid page={1} pageSize={20} startDate="2019-05-01" endDate="2019-06-10"  />
            </Grid>
        );
    }

}

export default compose(
    withStyles(styles)
)(PriceChange);