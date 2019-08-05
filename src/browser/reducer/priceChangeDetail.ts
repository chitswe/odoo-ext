import { createAction, getType } from "typesafe-actions";
import { DeepReadonly, $Call } from "utility-types";
import update from "immutability-helper";

export type PriceChangeDetailEditItem = Readonly<{
    id?: number;
    product?:  {
        id: number,
        name: string,
    };
    PriceBook?:  {
        id: number,
        name: string,
    };
    OldPrice?: number;
    NewPrice?: number;
    Approved?: boolean;
    errors: {
        product?: string;
        PriceBook?: string;
        NewPrice?: string;
    };
}>;

const editItemInitialState: PriceChangeDetailEditItem = {
    id: undefined,
    product: {
        id: undefined,
        name: ""
    },
    PriceBook: {
        id: undefined,
        name: ""
    },
    OldPrice: null,
    NewPrice: null,
    Approved: false,
    errors: {
        product: "",
        PriceBook: "",
        NewPrice: ""
    }
};

export const priceChangeDetailActions = {
    closeDialog: createAction("PriceChangeDetail/closeDialog"),
    openDialog: createAction("PriceChangeDetail/openDialog"),
    resetEdit: createAction("PriceChangeDetail/resetEdit"),
    loadEdit: createAction("PriceChangeDetail/loadEdit", resolve => (edit: PriceChangeDetailEditItem) =>
        resolve(edit)
    ),
    setEdit: createAction("PriceChangeDetail/setEdit", resolve => (edit: PriceChangeDetailEditItem) => 
        resolve(edit)
    )
};

function validatePriceChangeDetail(change: PriceChangeDetailEditItem) {
    let { product, PriceBook, OldPrice, NewPrice, errors} = change;
    errors = errors ? errors : {};
    let isValid = true;

    if (!product.name) {
        errors.product  = "product is required!";
        isValid = false;
    } else
        errors.product = "";
    
    if (!PriceBook.name) {
        errors.PriceBook = "PriceBook is required!";
        isValid = false;
    } else
        errors.PriceBook = "";
    
    if (!NewPrice) {
        errors.NewPrice = "NewPrice is required!";
        isValid = false;
    } else
        errors.NewPrice = "";

    return { errors, isValid };    
}

export type PriceChangeDetailState = DeepReadonly<{
    edit: PriceChangeDetailEditItem,
    edited: boolean,
    openDialog: boolean
}>;

const initialState: PriceChangeDetailState = {
    edit: editItemInitialState,
    edited: false,
    openDialog: false
};

export type PriceChangeDetailActions =
    $Call<typeof priceChangeDetailActions.resetEdit> |
    $Call<typeof priceChangeDetailActions.loadEdit> |
    $Call<typeof priceChangeDetailActions.setEdit> |
    $Call<typeof priceChangeDetailActions.openDialog> |
    $Call<typeof priceChangeDetailActions.closeDialog>;

export const priceChangeDetailReducer = (
    state: PriceChangeDetailState = initialState,
    action: PriceChangeDetailActions
) => {
    switch (action.type) {
        case(getType(priceChangeDetailActions.openDialog)):
            return update(state, {
                openDialog: {
                    $set: true
                }
            });
        case(getType(priceChangeDetailActions.closeDialog)):
            return update(state, {
                openDialog: {
                    $set: false
                }
            });
        case(getType(priceChangeDetailActions.resetEdit)):            
            return update(state, {
                edit: {
                    $set: editItemInitialState
                },
                edited: {
                    $set: false
                }
            });
        case(getType(priceChangeDetailActions.loadEdit)):
            return update(state, {
                edit: {
                    $set: action.payload
                },
                edited: {
                    $set: false
                }
            });
        case(getType(priceChangeDetailActions.setEdit)):
            let newPrice = Object.assign({}, state.edit, action.payload);
            newPrice = Object.assign(newPrice, validatePriceChangeDetail(newPrice));
            return update(state, {
                edit: {
                    $set: newPrice
                },
                edited: {
                    $set: true
                }
            });
        default:
            return state;
    }
};