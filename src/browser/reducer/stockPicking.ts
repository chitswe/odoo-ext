import { createAction, getType } from "typesafe-actions";
import {
  StockPickingType,
  StockMoveLineType
} from "../Inventory/StockPicking/resolvedTypes";
import { DeepReadonly, $Call } from "utility-types";
import update from "immutability-helper";
import { AsyncDispatch } from ".";
import { ProductTracking } from "../Inventory/StockPicking/types";
import { read } from "fs";

export type StockMoveInfo = {
  picking_number: string;
  product_default_code: string;
  schedule_date: Date;
  product_tracking: ProductTracking;
  printing_copy: number;
};

export  enum PrintingStatus {
  ready,
  printing,
  error
}

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
  ),
  setStockMoveLines: createAction("stockPicking/setStockMoveLines", resolve => {
    return (moveLines: ReadonlyArray<StockMoveLineType>) => resolve(moveLines);
  }),
  printSerialNoLabel: createAction(
    "stockPicking/printSerialNoLabel",
    resolve => {
      return (label: { printUrl: string; printingIndex: number }) =>
        resolve(label);
    }
  ),
  failSerialNoLabelPrinting: createAction(
    "stockPicking/failSerialNoLabelPrinting",
    resolve => {
      return (statusText: string) => resolve(statusText);
    }
  ),
  resetLabelPrintStatus: createAction("stockPicking/resetLabelPrintStatus"),
  setStockMoveInfo: createAction("stockPicking/setStockMoveInfo", resolve => {
    return (stockMoveInfo: StockMoveInfo) => resolve(stockMoveInfo);
  })
};

export type SerialNoLabelData = DeepReadonly<{
  StockCode: string;
  PurchaseDate: Date;
  SerialNo?: string;
  VoucherNo: string;
  Copy: number;
}>;

export type LabelPrintStatus = {
  printingMoveLine: StockMoveLineType;
  stockMoveInfo: StockMoveInfo;
  printingIndex: number;
  printingStatus: PrintingStatus;
  errorText: string;
};

export type StockPickingState = DeepReadonly<{
  selectedPicking?: {
    index: number;
    data: StockPickingType;
  };
  selectedStockMoveLine: ReadonlyArray<number>;
  stockMoveLines: ReadonlyArray<StockMoveLineType>;
  labelPrintStatus: LabelPrintStatus;
}>;

const initialState: StockPickingState = {
  selectedPicking: {
    index: null,
    data: null
  },
  selectedStockMoveLine: [],
  stockMoveLines: [],
  labelPrintStatus: {
    stockMoveInfo: {
      picking_number: null,
      product_default_code: "",
      schedule_date: null,
      product_tracking: ProductTracking.none,
      printing_copy: 0
    },
    printingMoveLine: null,
    printingIndex: 0,
    printingStatus: PrintingStatus.ready,
    errorText: ""
  }
};

export type StockPickingActions =
  | $Call<typeof stockPickingActions.setSelectedPicking> & AsyncDispatch
  | $Call<typeof stockPickingActions.addSelectedStockMoveLine> & AsyncDispatch
  | $Call<typeof stockPickingActions.removeSelectedStockMoveLine> &
      AsyncDispatch
  | $Call<typeof stockPickingActions.setSelectedStockMoveLine> & AsyncDispatch
  | $Call<typeof stockPickingActions.clearSelectedStockMoveLine> & AsyncDispatch
  | $Call<typeof stockPickingActions.setStockMoveLines> & AsyncDispatch
  | $Call<typeof stockPickingActions.printSerialNoLabel> & AsyncDispatch
  | $Call<typeof stockPickingActions.failSerialNoLabelPrinting> & AsyncDispatch
  | $Call<typeof stockPickingActions.resetLabelPrintStatus> & AsyncDispatch
  | $Call<typeof stockPickingActions.setStockMoveInfo> & AsyncDispatch;

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
    case getType(stockPickingActions.setStockMoveLines):
      return update(state, {
        stockMoveLines: {
          $set: action.payload
        }
      });
    case getType(stockPickingActions.printSerialNoLabel):
      if (
        state.labelPrintStatus.stockMoveInfo.product_tracking ===
        ProductTracking.none
      )
        return printLabelWithoutSerial(state, action);
      else return printLabelWithSerial(state, action);
    case getType(stockPickingActions.failSerialNoLabelPrinting):
      return update(state, {
        labelPrintStatus: {
          printingStatus: {
            $set: PrintingStatus.error
          },
          errorText: {
            $set: action.payload
          }
        }
      });
    case getType(stockPickingActions.resetLabelPrintStatus):
      return update(state, {
        labelPrintStatus: {
          printingStatus: {
            $set: PrintingStatus.ready
          },
          errorText: {
            $set: ""
          }
        }
      });
    case getType(stockPickingActions.setStockMoveInfo):
      return update(state, {
        labelPrintStatus: {
          stockMoveInfo: {
            $set: action.payload
          }
        }
      });
    default:
      return state;
  }
};

function printLabelWithoutSerial(
  state: StockPickingState,
  action: $Call<typeof stockPickingActions.printSerialNoLabel> & AsyncDispatch
) {
  let {
    labelPrintStatus: { stockMoveInfo }
  } = state;
  const { printingIndex } = action.payload;
  if (printingIndex === 1)
    return update(state, {
      labelPrintStatus: {
        printingStatus: {
          $set: PrintingStatus.ready
        },
        errorText: {
          $set: ""
        }
      }
    });
  const labelData: SerialNoLabelData = {
    VoucherNo: stockMoveInfo.picking_number,
    StockCode: stockMoveInfo.product_default_code,
    PurchaseDate: stockMoveInfo.schedule_date,
    Copy: stockMoveInfo.printing_copy
  };

  printSerialNoLabel(labelData, action);
  return {
    ...state,
    labelPrintStatus: {
      ...state.labelPrintStatus,
      printingIndex: 0,
      printingStatus: PrintingStatus.printing,
      errorText: ""
    }
  };
}

function printLabelWithSerial(
  state: StockPickingState,
  action: $Call<typeof stockPickingActions.printSerialNoLabel> & AsyncDispatch
) {
  let {
    payload: { printingIndex }
  } = action;
  let {
    labelPrintStatus: { printingMoveLine, stockMoveInfo },
    selectedStockMoveLine,
    stockMoveLines
  } = state;

  if (
    !stockMoveLines ||
    stockMoveLines.length === 0 ||
    !selectedStockMoveLine ||
    selectedStockMoveLine.length === 0
  )
    return update(state, {
      labelPrintStatus: {
        printingStatus: {
          $set: PrintingStatus.ready
        },
        errorText: {
          $set: ""
        }
      }
    });
  printingIndex = printingIndex ? printingIndex : 0;
  const index = selectedStockMoveLine[printingIndex];
  printingMoveLine = stockMoveLines[index];
  if (!printingMoveLine) {
    return {
      ...state,
      labelPrintStatus: {
        ...state.labelPrintStatus,
        printingIndex: 0,
        printingStatus: PrintingStatus.ready,
        printingMoveLine,
        errorText: ""
      }
    };
  }

  const labelData: SerialNoLabelData = {
    VoucherNo: stockMoveInfo.picking_number,
    StockCode: stockMoveInfo.product_default_code,
    SerialNo: printingMoveLine.lot_name,
    PurchaseDate: stockMoveInfo.schedule_date,
    Copy: 1
  };

  printSerialNoLabel(labelData, action);

  return {
    ...state,
    labelPrintStatus: {
      ...state.labelPrintStatus,
      printingIndex,
      printingStatus: PrintingStatus.printing,
      printingMoveLine,
      errorText: ""
    }
  };
}

function printSerialNoLabel(
  labelData: SerialNoLabelData,
  action: $Call<typeof stockPickingActions.printSerialNoLabel> & AsyncDispatch
) {
  let {
    payload: { printUrl, printingIndex }
  } = action;
  fetch(`${printUrl}/api/productserialnolabel/printlabel`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(labelData)
  })
    .then(response => {
      if (response.status === 200)
        action.asyncDispatch(
          stockPickingActions.printSerialNoLabel({
            printUrl,
            printingIndex: printingIndex + 1
          })
        );
      else
        action.asyncDispatch(
          stockPickingActions.failSerialNoLabelPrinting(response.statusText)
        );
    })
    .catch(error => {
      action.asyncDispatch(
        stockPickingActions.failSerialNoLabelPrinting(error)
      );
    });
}
