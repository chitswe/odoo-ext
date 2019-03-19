import { createAction, getType } from "typesafe-actions";
import { $Call, DeepReadonly } from "utility-types";
import { MasterPriceList, ProductType } from "../PriceList/resolvedTypes";
import * as lodash from "lodash";
import update from "immutability-helper";
export const priceListActions = {
  setMasterPriceList: createAction(
    "priceList/setMasterPriceList",
    resolve => (priceList: MasterPriceList[]) => resolve(priceList)
  ),
  setSelectedPriceList: createAction(
    "priceList/setSelectedPriceList",
    resolve => (ids: number[]) => resolve(ids)
  ),
  setEdit: createAction("priceList/setEdit", resolve => (edit: ProductType) =>
    resolve(edit)
  ),
  resetEdit: createAction("priceList/resetEdit"),
  loadEdit: createAction("priceList/loadEdit", resolve => (edit: ProductType) =>
    resolve(edit)
  )
};

export type PriceListState = {
  master: { [id: number]: MasterPriceList };
  selected: number[];
  masterList: MasterPriceList[];
  edit: ProductType;
  edited: boolean;
};

const initialState: PriceListState = {
  master: {},
  selected: [1],
  masterList: [],
  edit: null,
  edited: false
};

function normalizeArray<T>(array: Array<T>, indexKey: keyof T) {
  const normalizedObject: any = {};
  for (let i = 0; i < array.length; i++) {
    const key = array[i][indexKey];
    normalizedObject[key] = array[i];
  }
  return normalizedObject as { [key: number]: T };
}

export type PriceListActions =
  | $Call<typeof priceListActions.setMasterPriceList>
  | $Call<typeof priceListActions.setSelectedPriceList>
  | $Call<typeof priceListActions.setEdit>
  | $Call<typeof priceListActions.resetEdit>
  | $Call<typeof priceListActions.loadEdit>;

export const priceListReducer = (
  state: PriceListState = initialState,
  action: PriceListActions
) => {
  switch (action.type) {
    case getType(priceListActions.setMasterPriceList):
      const arr = normalizeArray(action.payload, "id");
      return update(state, {
        master: {
          $set: arr
        },
        masterList: {
          $set: action.payload
        }
      });
    case getType(priceListActions.setSelectedPriceList):
      return update(state, {
        selected: {
          $set: action.payload
        }
      });
    case getType(priceListActions.setEdit):
      return update(state, {
        edit: {
          $set: action.payload
        },
        edited: {
          $set: true
        }
      });
    case getType(priceListActions.resetEdit):
      return update(state, {
        edit: {
          $set: null
        },
        edited: {
          $set: false
        }
      });
    case getType(priceListActions.loadEdit):
      return update(state, {
        edit: {
          $set: action.payload
        },
        edited: {
          $set: false
        }
      });
    default:
      return state;
  }
};
