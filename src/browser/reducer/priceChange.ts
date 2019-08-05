import { createAction, getType } from "typesafe-actions";
import { PriceChangeType } from "../PriceChange/resolvedTypes";
import { DeepReadonly, $Call } from "utility-types";
import  update from "immutability-helper";
import { PriceChangeDetailEditItem } from "./priceChangeDetail";

export type PriceChangeEditItem = Readonly<{
    id?: number;
    PriceChangeDate?: string;
    Remark?: string;
    detail?: PriceChangeDetailEditItem[],
    errors: {
      PriceChangeDate?: string;
      Remark?: string;
    };
  }>;

const editItemInitialState: PriceChangeEditItem = {
    id: undefined,
    Remark: "",
    PriceChangeDate: undefined,
    detail: [],
    errors: {
        PriceChangeDate: "",
        Remark: ""
    }
};

export const priceChangeActions = {
    resetEdit: createAction("PriceChange/resetEdit"),
    loadEdit: createAction("PriceChange/loadEdit", resolve => (edit: PriceChangeEditItem) => 
        resolve(edit)),
    setEdit: createAction("PriceChange/setEdit", resolve => (edit: PriceChangeEditItem) => 
        resolve(edit)),
    setItems: createAction("PriceChange/setItems", resolve => (items: PriceChangeDetailEditItem[]) => 
        resolve(items)),
    setItem: createAction("PriceChange/setItem", resolve => (edit: { item: PriceChangeDetailEditItem, index: number}) => 
        resolve(edit)),
    addItem: createAction("PriceChange/addItem", resolve => (item: PriceChangeDetailEditItem) => 
        resolve(item))
};

function validatePriceChange(change: PriceChangeEditItem) {
    let { id, PriceChangeDate, Remark, errors } = change;
    errors = errors ? errors : {};
    let isValid = true;

    if (!PriceChangeDate) {
        errors.PriceChangeDate = "PriceChange Date is required!";
        isValid = false;
    } else
        errors.PriceChangeDate = "";

    return { isValid, errors };
}

export type PriceChangeState = DeepReadonly<{
    edit: PriceChangeEditItem;
    edited: boolean;
}>;

const initialState: PriceChangeState = {
    edit: editItemInitialState,
    edited: false
};

export type PriceChangeActions =
    | $Call<typeof priceChangeActions.loadEdit>
    | $Call<typeof priceChangeActions.setEdit>
    | $Call<typeof priceChangeActions.resetEdit>
    | $Call<typeof priceChangeActions.setItems>
    | $Call<typeof priceChangeActions.setItem>
    | $Call<typeof priceChangeActions.addItem>;

export const priceChangeReducer = (
    state: PriceChangeState = initialState,
    action: PriceChangeActions
) => {
    switch (action.type) {
        case(getType(priceChangeActions.loadEdit)):
            return update(state, {
                edit: {
                    $set: action.payload
                },
                edited: {
                    $set: false
                }
            });
        case(getType(priceChangeActions.setEdit)):
            let newPrice = Object.assign({}, state.edit, action.payload);
            newPrice = Object.assign(newPrice, validatePriceChange(newPrice));
            return update(state, {
                edit: {
                    $set: newPrice
                },
                edited: {
                    $set: true
                }
            });
        case(getType(priceChangeActions.resetEdit)):
            return update(state, {
                edit: {
                    $set: editItemInitialState
                },
                edited: {
                    $set: false
                }
            });
        case(getType(priceChangeActions.addItem)):
            return update(state, {
                edit: {
                    detail: {
                        $push: [action.payload ]
                    }
                }
            });
        case(getType(priceChangeActions.setItems)):
            return update(state, {
                edit: {
                    detail: {
                        $set: action.payload
                    }
                }
            });
        case(getType(priceChangeActions.setItem)):
            return update(state, {
                edit: {
                    detail: {
                        [action.payload.index]:
                        {
                            $set: action.payload.item
                        }                        
                    }
                }
            });
        default:
            return state;
    }
};