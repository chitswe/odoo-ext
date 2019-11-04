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
import { FaSearch } from "react-icons/fa";
import PaymentGrid from "./PaymentGrid";
import TextEditor from "../component/TextEditor";

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
        }
    });

type Props = WithStyles<typeof styles> & RouteComponentProps<{ orderId: string }>;

type State = {
    searchText: string;
    search: string;
    open: boolean;
    dateFrom: string;
    dateTo: string;
    partner: string;
    filter: any;
};

class Payment extends React.Component<Props, State> {
    state: State = {
        searchText: "",
        search: "",
        open: false,
        dateFrom: "",
        dateTo: "",
        partner: "",
        filter: []
    };

    componentDidMount() {
        let {match} = this.props;
        if (match.params.orderId) {
            const searchFilter = [];
            searchFilter.push(["id", "=", match.params.orderId]);
            this.setState({filter: searchFilter});
        }
    }

    componentWillReceiveProps(newProps: Props) {
        if (newProps.match.params.orderId !== this.props.match.params.orderId) {
            if (newProps.match.params.orderId) {
                const searchFilter = [];
                searchFilter.push(["id", "=", newProps.match.params.orderId]);
                this.setState({filter: searchFilter});
            } else {
                const searchFilter = [];
                let {partner, dateFrom, dateTo} = this.state;
                if (partner)
                    searchFilter.push(["partner_id", "ilike", partner]);
                if (dateFrom)
                    searchFilter.push(["payment_date", ">=", dateFrom]);
                if (dateTo)
                    searchFilter.push(["payment_date", "<=", dateTo]);
                
                this.setState({filter: searchFilter});
            }                
        }
      }

    render() {
        const { classes, match } = this.props;
        const { searchText, search, open, dateFrom, dateTo, partner, filter} = this.state;

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
                                id="partner"
                                label="Partner"
                                className={classes.textField}
                                value={partner}
                                onChange={(e) => {
                                    this.setState(({partner: e.target.value}));
                                }}
                            />
                            <TextField
                                id="datefrom"
                                label="From"
                                className={classes.textField}
                                type="date"
                                value={dateFrom}
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) => {
                                    this.setState(({dateFrom: e.target.value}));
                                }}
                            />
                            <TextField
                                id="dateTo"
                                label="To"
                                className={classes.textField}
                                type="date"
                                value={dateTo}
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) => {
                                    this.setState(({dateTo: e.target.value}));
                                }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    const searchFilter = [];
                                    if (partner)
                                        searchFilter.push(["partner_id", "ilike", partner]);
                                    if (dateFrom)
                                        searchFilter.push(["payment_date", ">=", dateFrom]);
                                    if (dateTo)
                                        searchFilter.push(["payment_date", "<=", dateTo]);
                                    
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
                            Payments
                        </Typography>
                        <div className={classes.grow} />
                        <IconButton 
                            color="inherit"
                            onClick={() => {
                                this.setState({open: true});
                            }}
                        >
                            <FaSearch/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <PaymentGrid filter={filter} orderId={match.params.orderId} />
            </Grid>
        );
    }
}

export default compose(
    withStyles(styles)
)(Payment);