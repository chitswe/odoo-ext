import * as React from "react";
import {
    Grid,
    Theme,
    createStyles,
    WithStyles,
    Typography,
    IconButton,
    withStyles,
    InputBase,
    CircularProgress,
    LinearProgress,
    Drawer,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent
} from "@material-ui/core";
import { compose, Mutation } from "react-apollo";
import { connect } from "react-redux";
import { RootState, RootAction } from "../reducer";
import { Dispatch, bindActionCreators } from "redux";
import { priceChangeDetailActions, PriceChangeDetailEditItem } from "../reducer/priceChangeDetail";
import { priceChangeActions } from "../reducer/priceChange";
import update from "immutability-helper";
import CurrencyEditor from "../component/CurrencyEditor";
import AutoComplete from "../component/AutoComplete";
import { ProductType } from "./resolvedTypes";
import { ApolloListResult } from "../component/VirtualizedGrid/ApolloVirtualizedGrid";
import { createPriceChangeDetailMutation, updatePriceChangeDetailMutation, productListQuery } from "./graphql";

const styles =  (theme: Theme) => 
    createStyles({
        root: {},
        textField: {
            width: 200,
            marginTop: theme.spacing.unit * 3,
            marginBottom: theme.spacing.unit * 2
        },
        price: {
            width: "100%"
        },
    });

type Props = {
    edit: PriceChangeDetailEditItem;
    setEdit: typeof priceChangeDetailActions.setEdit;
    addItem: typeof priceChangeActions.addItem;
    setItem: typeof priceChangeActions.setItem;
    closeDialog: typeof priceChangeDetailActions.closeDialog;
    open: boolean;
    PriceChangeId: number;
    index: number;
} & WithStyles<typeof styles>;

type State = {
    searchText: string;
    variables: any;
};

class PriceChangeDetailDialog extends React.Component<Props, State> {
    state: State = {
        searchText: "",
        variables: { filter : [[["name", "=ilike", "xx%"]]]}
    };

    // componentDidMount() {
    //     let { edit } = this.props;
    //     this.setState({searchText: edit.product ? edit.product.name : ""});
    // }

    render() {
        const { classes, open, PriceChangeId, edit, setEdit, closeDialog, addItem, setItem, index } = this.props;
        const { id, product, PriceBook, OldPrice, NewPrice, errors } = edit;

        return (     
             
            <Dialog
                open={open}
                aria-labelledby="form-dialog-title"
                onClose={() => { closeDialog(); }}
            >
                <DialogTitle>Price Change Item</DialogTitle>
                <DialogContent>    
                    {
                        id ?
                        <Mutation
                            mutation={updatePriceChangeDetailMutation}       
                            key={id}
                            onCompleted={data => {
                                if (data.updatePriceChangeDetail)
                                    setItem({item: { ...data.updatePriceChangeDetail, errors}, index});
                            }}
                        >
                            {
                                (updatePriceChangeDetail, { data, loading, error }) => ( 
                                    <Grid container>
                                        {/* <Grid item xs={12} >
                                            <TextField
                                                id="product"
                                                label="Product"
                                                className={classes.textField}
                                                value={product ? product.id : null}
                                                InputLabelProps={{ shrink: true }}
                                                helperText={errors.product}
                                                onChange={(e) => {
                                                    let item = { id: Number(e.target.value), name: "test"};
                                                    setEdit({ product: item, errors: { product: ""}});
                                                }}
                                            />
                                        </Grid> */}
                                        <Grid item xs={12} >
                                            <AutoComplete                                              
                                                searchText={product ? product.name : ''}
                                                openonfocus={true}
                                                onUpdateInput={(value: any) => {
                                                    if (value)
                                                        //this.setState({searchText: value});
                                                        setEdit({ product: value, errors: { product: ""}});
                                                }}
                                                variables={this.state.variables}
                                                onNewChange={(value: string) => {    
                                                                value = value !== "" ? value + "%" : "xxx$";
                                                                const filter = [
                                                                [
                                                                    ["name", "=ilike", value]
                                                                ]
                                                                ];
                                                                setTimeout(() => {
                                                                this.setState({
                                                                    variables: update(this.state.variables, {
                                                                    filter: {
                                                                        $set: filter
                                                                    }
                                                                    })
                                                                });
                                                                }, 3000);
                                                }}
                                                graphqlQuery={productListQuery}
                                                listPropsName="products"
                                                updateQuery={(
                                                    previousResult: any,
                                                    list: ApolloListResult<ProductType>
                                                    ) => {
                                                    return update(previousResult, {
                                                        product: {
                                                            $set: list
                                                        }
                                                    });
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} >
                                            <TextField
                                                id="priceBook"
                                                label="PriceBook"
                                                className={classes.textField}
                                                value={PriceBook ? PriceBook.id : null}
                                                InputLabelProps={{ shrink: true }}
                                                helperText={errors.PriceBook}
                                                onChange={(e) => {
                                                    let item = { id: Number(e.target.value), name: "test"};
                                                    setEdit({ PriceBook: item, errors: { PriceBook: ""}});
                                                }}
                                            />   
                                        </Grid>
                                        <Grid item xs={12} >
                                            <CurrencyEditor
                                                disabled={true}
                                                retainFocusOnError={true}
                                                label="OldPrice"
                                                numberPrecision={0}
                                                value={OldPrice}                        
                                                className={classes.price}
                                            />
                                        </Grid>
                                        <Grid item xs={12} >
                                            <CurrencyEditor
                                                retainFocusOnError={true}
                                                label="NewPrice"
                                                numberPrecision={0}
                                                value={NewPrice}
                                                helperText={errors.NewPrice}
                                                className={classes.price}
                                                onChanged={value => {
                                                    setEdit({NewPrice: value, errors: { NewPrice: "" }});
                                                }}
                                            />   
                                        </Grid>
                                        <Grid item xs={12} >
                                            <Button onClick={() => { updatePriceChangeDetail({ variables: { id, PriceChangeId, ProductId: product.id, PriceBookId: PriceBook.id, OldPrice: 0, NewPrice }}); }} variant="contained" color="primary">Save</Button>
                                            <Button onClick={() => { closeDialog(); }} variant="contained" color="primary">Close</Button>
                                        </Grid>
                                    </Grid>
                                )
                            }
                        </Mutation>
                        :
                        <Mutation
                            mutation={createPriceChangeDetailMutation}       
                            key={id}
                            onCompleted={data => {
                                if (data.createPriceChangeDetail)
                                    addItem({...data.createPriceChangeDetail, errors});
                            }}
                        >
                            {
                                (createPriceChangeDetail, { loading: saving, error: saveError }) => ( 
                                    <Grid container>
                                        <Grid item xs={12} >
                                            <AutoComplete                                              
                                                searchText={product ? product.name : ''}
                                                openonfocus={true}
                                                onUpdateInput={(value: any) => {
                                                    if (value)
                                                        //this.setState({searchText: value});
                                                        setEdit({ product: value, errors: { product: ""}});
                                                }}
                                                variables={this.state.variables}
                                                onNewChange={(value: string) => {    
                                                                value = value !== "" ? value + "%" : "xxx$";
                                                                const filter = [
                                                                  [
                                                                    ["name", "=ilike", value]
                                                                  ]
                                                                ];
                                                                setTimeout(() => {
                                                                  this.setState({
                                                                    variables: update(this.state.variables, {
                                                                      filter: {
                                                                        $set: filter
                                                                      }
                                                                    })
                                                                  });
                                                                }, 3000);
                                                }}
                                                graphqlQuery={productListQuery}
                                                listPropsName="products"
                                                updateQuery={(
                                                    previousResult: any,
                                                    list: ApolloListResult<ProductType>
                                                    ) => {
                                                    return update(previousResult, {
                                                        product: {
                                                            $set: list
                                                        }
                                                    });
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} >
                                            <TextField
                                                id="product"
                                                label="Product"
                                                className={classes.textField}
                                                value={product ? product.id : null}
                                                InputLabelProps={{ shrink: true }}
                                                helperText={errors.product}
                                                disabled={true}
                                                onChange={(e) => {
                                                    let item = { id: Number(e.target.value), name: "test"};
                                                    setEdit({ product: item, errors: { product: ""}});
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} >
                                            <TextField
                                                id="priceBook"
                                                label="PriceBook"
                                                className={classes.textField}
                                                value={PriceBook ? PriceBook.id : null}
                                                InputLabelProps={{ shrink: true }}
                                                helperText={errors.PriceBook}
                                                onChange={(e) => {
                                                    let item = { id: Number(e.target.value), name: "test"};
                                                    setEdit({ PriceBook: item, errors: { PriceBook: ""}});
                                                }}
                                            />   
                                        </Grid>
                                        <Grid item xs={12} >
                                            <CurrencyEditor
                                                disabled={true}
                                                retainFocusOnError={true}
                                                label="OldPrice"
                                                numberPrecision={0}
                                                value={OldPrice}                        
                                                className={classes.price}
                                            />
                                        </Grid>
                                        <Grid item xs={12} >
                                            <CurrencyEditor
                                                retainFocusOnError={true}
                                                label="NewPrice"
                                                numberPrecision={0}
                                                value={NewPrice}
                                                helperText={errors.NewPrice}
                                                className={classes.price}
                                                onChanged={value => {
                                                    setEdit({NewPrice: value, errors: { NewPrice: "" }});
                                                }}
                                            />   
                                        </Grid>
                                        <Grid item xs={12} >
                                            <Button onClick={() => { createPriceChangeDetail({ variables: { PriceChangeId, ProductId: product.id, PriceBookId: PriceBook.id, OldPrice: 0, NewPrice }}); }} variant="contained" color="primary">Save</Button>
                                            <Button onClick={() => { closeDialog(); }} variant="contained" color="primary">Close</Button>
                                        </Grid>
                                    </Grid>
                                )
                            }
                        </Mutation>
                    }                   
                </DialogContent>
                {/* <DialogActions>
                    <Button onClick={() => { createPriceChangeDetail({ variables: { PriceChangeId, ProductId: product.id, PriceBookId: PriceBook.id, OldPrice: 0, NewPrice }}).then((result: any) => { addItem({id: result.id, product, PriceBook, OldPrice, NewPrice, errors}); }); }} variant="contained" color="primary">Add</Button>
                    <Button onClick={() => { closeDialog(); }} variant="contained" color="primary">Close</Button>
                </DialogActions> */}
            </Dialog>
            
        );
    }
}

export default compose(
    connect(
        (state: RootState) => ({
            edit: state.priceChangeDetail.edit,
            open: state.priceChangeDetail.openDialog
        }),
        (dispatch: Dispatch<RootAction>) => 
            bindActionCreators(
            {
                setEdit: priceChangeDetailActions.setEdit,
                closeDialog: priceChangeDetailActions.closeDialog,
                addItem: priceChangeActions.addItem,
                setItem: priceChangeActions.setItem
            },
            dispatch
        )
    ),
    withStyles(styles)
)(PriceChangeDetailDialog);