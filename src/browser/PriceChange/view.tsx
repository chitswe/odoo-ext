import * as React from "react";
import { Switch, Route, RouteComponentProps, withRouter } from "react-router";
import {
    Grid,
    Theme,
    createStyles,
    withStyles,
    WithStyles,
    AppBar,
    Typography,
    IconButton,
    TextField,
    Button,
    CircularProgress,
    Toolbar,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@material-ui/core";
import OpenDrawerButton from "../component/AppBar/OpenDrawerButton";
import { compose, ApolloConsumer, Query, Mutation } from "react-apollo";
import { connect } from "react-redux";
import { RootAction, RootState  } from "../reducer";
import { bindActionCreators, Dispatch } from "redux";
import { getPriceChangeQuery, createPriceChangeMutation, updatePriceChangeMutation } from "./graphql";
import { priceChangeActions, PriceChangeEditItem } from "../reducer/priceChange";
import { priceChangeDetailActions, PriceChangeDetailEditItem } from "../reducer/priceChangeDetail";
import { PriceChangeType, PriceChangeDetailType } from "./resolvedTypes";
import * as accounting from "accounting";
import ApolloVirtualizedGrid, {
    ApolloListResult
  } from "../component/VirtualizedGrid/ApolloVirtualizedGrid";
import VirtualizedDataGrid from "../component/VirtualizedGrid";
import { GridColumn } from "../component/VirtualizedGrid";
// import CsGrid, {
//     CsGridDataItem,
//     CsGridProps,
//     CsGridColumn,
//     ResponsiveBreakPoint
//   } from "../component/CsGrid";
import PriceChangeDetailDialog from "./PriceChangeDetailDialog";

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
        fieldWrapper: {
            display: "flex",
            marginBottom: 8,
            flexWrap: "nowrap"
        },
        label: {
            width: 116,
            textAlign: "right",
            marginRight: 8
        },
        textField: {
            width: 200,
            marginTop: theme.spacing.unit * 3,
            marginBottom: theme.spacing.unit * 2
        },
        root: {},
        fill: {
            flex: 1
        },
        row: {
            flex: 1,
            flexWrap: "nowrap"
        },
        table: {
            flex: 1
        }
    });

type Props = { 
    edit: PriceChangeEditItem;
    setEdit: typeof priceChangeActions.setEdit;
    loadEdit: typeof priceChangeActions.loadEdit;
    resetEdit: typeof priceChangeDetailActions.resetEdit;
    openDialog: typeof priceChangeDetailActions.openDialog;
    loadDetail: typeof priceChangeDetailActions.loadEdit;
    theme: Theme;
 } & WithStyles<typeof styles>;

// type TCsGrid = new () => CsGrid<PriceChangeDetailDataItem>;
// const TCsGrid = CsGrid as TCsGrid;
 
//type PriceChangeDetailDataItem = PriceChangeDetailEditItem & CsGridDataItem;

type State = {
    columns: ReadonlyArray<GridColumn<PriceChangeDetailEditItem>>;
    open: boolean;
    loading: boolean;
    selected: [],
    index: number
};

class PriceChangeDetail extends React.Component<Props, State> {
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
                label: "Product",
                key: "product",
                width: 100,
                labelAlign: "left",
                textAlign: "left",
                format: ({ key, rowData }) => 
                    rowData.product ? rowData.product.name : "",
                sortable: true,
                hideAt: 600
            },
            {
                label: "PriceBook",
                key: "PriceBook",
                width: 250,
                labelAlign: "center",
                textAlign: "left",
                format: ({ key, rowData }) => 
                    rowData.PriceBook ? rowData.PriceBook.name : "",
                sortable: true,
                hideAt: 600
            },
            {
                label: "OldPrice",
                key: "OldPrice",
                width: 150,
                labelAlign: "center",
                textAlign: "left",
                format: ({ key, rowData }) =>
                    accounting.formatMoney(rowData.OldPrice, { format: "%v", precision: accounting.settings.number.precision})
            },
            {
                label: "NewPrice",
                key: "NewPrice",
                width: 150,
                labelAlign: "center",
                textAlign: "left",
                format: ({ key, rowData }) =>
                    accounting.formatMoney(rowData.NewPrice, { format: "%v", precision: accounting.settings.number.precision})
            }
        ],
        open: false,
        loading: false,
        index: 0,
        selected: []
    };
    
    render() {
        const { classes, setEdit, edit, openDialog, resetEdit, loadDetail, theme } = this.props;
        let { id, PriceChangeDate, Remark, detail, errors } = edit;
        const { open } = this.state;

        //const records: PriceChangeDetailDataItem[] = detail ? detail : [];

        return (
                <Mutation
                    mutation={updatePriceChangeMutation}
                    key={id}
                >
                {
                    (updatePriceChange , { loading: saving, error: saveError }) => (
                        <Grid container direction="column" className={classes.root}>
                            <AppBar position="static" className={classes.appBar}>
                                <Toolbar className={classes.toolBar}>
                                    <OpenDrawerButton />
                                    <Typography variant="h6" color="inherit" noWrap>
                                        Price Change Detail
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                            <div className={classes.root}>
                                <Grid container>
                                    <Grid item xs={12} md={6} className={classes.fieldWrapper} >
                                        <TextField
                                            id="date"
                                            label="Date"
                                            className={classes.textField}
                                            type="date"
                                            value={PriceChangeDate}
                                            InputLabelProps={{ shrink: true }}
                                            helperText={errors.PriceChangeDate}
                                            onChange={(e) => {
                                                setEdit({PriceChangeDate: e.target.value , errors: { PriceChangeDate: "" }});
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6} className={classes.fieldWrapper} >
                                        <TextField
                                            id="remark"
                                            label="Remark"
                                            className={classes.textField}
                                            value={Remark}
                                            helperText={errors.Remark}
                                            InputLabelProps={{ shrink: true }}
                                            onChange={(e) => {
                                                setEdit({Remark: e.target.value , errors: { Remark: "" }});
                                            }}
                                        />
                                    </Grid>                                                                    
                                </Grid>                                 
                                <Grid container>
                                    <Grid item xs={6} className={classes.fieldWrapper} >
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => { if (id) { resetEdit(); openDialog(); } }}
                                        > Add Item
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6} className={classes.fieldWrapper} >
                                        <Button 
                                            variant="contained"
                                            color="primary"
                                            onClick={() => { updatePriceChange({ variables: { id, PriceChangeDate, Remark }}); }}
                                        >
                                        Save Info
                                        </Button>
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <Grid
                                        item
                                        xs={12}
                                        className={classes.fill}
                                    >
                                    <Table className={classes.table}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="right">Product</TableCell>
                                                <TableCell align="right">PriceBook</TableCell>
                                                <TableCell align="right">OldPrice</TableCell>
                                                <TableCell align="right">NewPrice</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {detail.map((row, i) => (
                                            <TableRow key={row.id} onClick={() => { this.setState({ index: i}); loadDetail(row); openDialog(); }}>
                                                <TableCell component="th" scope="row">
                                                    {row.product ? row.product.name : ""}
                                                </TableCell>
                                                <TableCell align="right">{row.PriceBook ? row.PriceBook.name : ""}</TableCell>
                                                <TableCell align="right">{accounting.formatMoney(row.OldPrice, { format: "%v", precision: accounting.settings.number.precision})}</TableCell>
                                                <TableCell align="right">{accounting.formatMoney(row.NewPrice, { format: "%v", precision: accounting.settings.number.precision})}</TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                    {/* {
                                        records.map((p, i) => (<Typography onClick={() => { this.setState({ index: i}); loadDetail(p); openDialog(); }} >{ p.product ? p.product.name : "" }</Typography>))
                                    } */}
                                        {/* <TCsGrid
                                            data={records}
                                            primaryKey="id"
                                            loading={false}
                                            columns={this.state.columns}
                                            refetch={() => { this.setState({loading: false}); }}
                                            fetchMore={() => { this.setState({loading: false}); }}
                                            onRowDoubleClick={ (item) => { this.setState({ index: records.indexOf(item)}); loadDetail(item); openDialog(); }}
                                            selected={this.state.selected}
                                            changeToCardAt={ResponsiveBreakPoint.xs}
                                            cardLabelWidth={100}
                                            hasMore={false}
                                            page={1}
                                            muiTheme={theme}
                                            rowsSelectionChanged={selected => {
                                                this.setState({loading: false});
                                            }}
                                        /> */}
                                        {/* <VirtualizedDataGrid
                                            rowGetter={(index: number) => detail[index]}
                                            totalRowCount={detail.length}
                                            rowCount={detail.length}
                                            isRowLoaded={(index: number) =>
                                                detail && !! detail[index]
                                            }
                                            columns={this.state.columns}
                                        /> */}

                                    </Grid>
                                </Grid>
                                <PriceChangeDetailDialog PriceChangeId={id} index={this.state.index} />
                            </div>
                        </Grid>
                    )
                }
                </Mutation>
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
                setEdit: priceChangeActions.setEdit,
                loadEdit: priceChangeActions.loadEdit,
                resetEdit: priceChangeDetailActions.resetEdit,
                loadDetail: priceChangeDetailActions.loadEdit,
                openDialog: priceChangeDetailActions.openDialog
            },
            dispatch
        )
    ),
    withRouter,
    withStyles(styles)
)(PriceChangeDetail);