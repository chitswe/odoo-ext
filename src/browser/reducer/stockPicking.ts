import { createAction, getType } from "typesafe-actions";
import { StockPickingType, StockMoveLineType } from "../Inventory/StockPicking/resolvedTypes";
import { DeepReadonly, $Call } from "utility-types";
import update from "immutability-helper";

export const stockPickingActions = {
  setSelectedPicking: createAction(
    "stockPicking/setSelectedPicking",
    resolve => {
      return (picking: { index: number; data: StockPickingType }) =>
        resolve(picking);
    }
  ),
  addSelectedStockMoveLine: createAction(
    "stockPicking/addSelectedStockMoveLine",
    resolve => {
      return (index: number) => resolve(index);
    }
  ),
  removeSelectedStockMoveLine: createAction(
    "stockPicking/removeSelectedStockMoveLine",
    resolve => {
      return (index: number) => resolve(index);
    }
  ),
  setSelectedStockMoveLine: createAction(
    "stockPicking/setSelectedStockMoveLine",
    resolve => {
      return (selected: number[]) => resolve(selected);
    }
  ),
  clearSelectedStockMoveLine: createAction(
    "stockPicking/clearSelectedStockMoveLine"
  )
};

export type StockPickingState = DeepReadonly<{
  selectedPicking?: {
    index: number;
    data: StockPickingType;
  };
  selectedStockMoveLine: ReadonlyArray<number>;
}>;

const initialState: StockPickingState = {
  selectedPicking: {
    index: null,
    data: null
  },
  selectedStockMoveLine: []
};

export type StockPickingActions =
  | $Call<typeof stockPickingActions.setSelectedPicking>
  | $Call<typeof stockPickingActions.addSelectedStockMoveLine>
  | $Call<typeof stockPickingActions.removeSelectedStockMoveLine>
  | $Call<typeof stockPickingActions.setSelectedStockMoveLine>
  | $Call<typeof stockPickingActions.clearSelectedStockMoveLine>;

export const stockPickingReducer = (
  state: StockPickingState = initialState,
  action: StockPickingActions
) => {
  switch (action.type) {
    case getType(stockPickingActions.setSelectedPicking):
      return Object.assign({}, state, { selectedPicking: action.payload });
    case getType(stockPickingActions.addSelectedStockMoveLine):
      return update(state, {
        selectedStockMoveLine: {
          $push: [action.payload]
        }
      });
    case getType(stockPickingActions.removeSelectedStockMoveLine):
      if (state.selectedStockMoveLine.indexOf(action.payload) === -1)
        return state;
      return update(state, {
        selectedStockMoveLine: {
          $splice: [[state.selectedStockMoveLine.indexOf(action.payload), 1]]
        }
      });
    case getType(stockPickingActions.setSelectedStockMoveLine):
      return update(state, {
        selectedStockMoveLine: {
          $set: action.payload
        }
      });
    case getType(stockPickingActions.clearSelectedStockMoveLine):
      return update(state, {
        selectedStockMoveLine: {
          $set: []
        }
      });
    default:
      return state;
  }
};
