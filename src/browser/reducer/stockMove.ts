import { createAction, getType } from "typesafe-actions";
import { DeepReadonly, $Call } from "utility-types";
import update from "immutability-helper";

export const stockMoveActions = {
  editMoveLine: createAction(
      "stockMove/editMoveLine",
      resolve => (edit: { item: InputStockMoveLineType, index: number}) => resolve(edit)
  ),
  addMoveLine: createAction(
      "stockMove/addMoveLine",
      resolve => (item: InputStockMoveLineType) => resolve(item) 
  ),
  removeMoveLine: createAction(
      "stockMove/removeMoveLine",
      resolve => (index: number) => resolve(index)
  )
};

export type InputStockMoveLineType = {
  id: number;
  lot_name: string;
  moveId: number;
  verified: boolean;
  status: boolean;
  error: string;
};

export type StockMoveState = DeepReadonly<{
  stockMoveLineList: ReadonlyArray<InputStockMoveLineType>;
}>;

const initialState: StockMoveState = {
  stockMoveLineList: []
};

export type StockMoveActions =
  | $Call<typeof stockMoveActions.editMoveLine>
  | $Call<typeof stockMoveActions.addMoveLine>
  | $Call<typeof stockMoveActions.removeMoveLine>;

export const stockMoveReducer = (
  state: StockMoveState = initialState,
  action: StockMoveActions
) => {
  switch (action.type) {
    case getType(stockMoveActions.editMoveLine):
        return update(state, {
              stockMoveLineList: {
                  [action.payload.index]: {
                      $set: action.payload.item
                  }
            }
        });
    case getType(stockMoveActions.addMoveLine):
        return update(state, {
              stockMoveLineList: {
                  $push : [action.payload]
              }
        });
    case getType(stockMoveActions.removeMoveLine):
        return update(state, {
              stockMoveLineList: {
                  $splice: [[action.payload, 1]]
              }
        });
    default:
      return state;
  }
};