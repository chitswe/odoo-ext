import { createAction, getType } from "typesafe-actions";
import { $Call, DeepReadonly } from "utility-types";
import { AsyncDispatch } from ".";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { siteActions } from "./site";
export const labelPrintSettingActions = {
  setUrl: createAction("labelPrintSetting/setUrl", resolve => {
    return (url: string) => resolve(url);
  }),
  loadPrintSetting: createAction("labelPrintSetting/loadPrintSetting"),
  setPrintSetting: createAction(
    "labelPrintSetting/setPrintSetting",
    resolve => {
      return (setting: LabelPrintSetting) => resolve(setting);
    }
  ),
  completeFetchPrintSetting: createAction(
    "labelPrintSetting/completeFetchPrintSetting",
    resolve => {
      return (setting: LabelPrintSetting) => resolve(setting);
    }
  ),
  failFetchPrintSetting: createAction(
    "labelPrintSetting/failFetchPrintSetting",
    resolve => (error: string) => resolve(error)
  ),
  savePrintSetting: createAction("labelPrintSetting/savePrintSetting"),
  completeSavePrintSetting: createAction(
    "labelPrintSetting/completeSavePrintSetting"
  ),
  failSavePrintSetting: createAction(
    "labelPrintSetting/failSavePrintSetting",
    resolve => (error: string) => resolve(error)
  )
};

type LabelPrintSetting = DeepReadonly<{
  PrintPIDCode?: boolean;
  PrintPIDCode_X?: number;
  PrintPIDCode_Y?: number;
  PrintPIDCode_W?: number;
  PrintPIDCode_H?: number;
  PrintPIDText?: boolean;
  PIDText_X?: number;
  PIDText_Y?: number;
  PIDText_H?: number;

  PrintStockCodeCode?: boolean;
  StockCode_X?: number;
  StockCode_Y?: number;
  StockCode_W?: number;
  StockCode_H?: number;
  PrintStockCodeText?: boolean;
  StockCodeText_X?: number;
  StockCodeText_Y?: number;
  StockCodeText_H?: number;

  PrintSerialNoCode?: boolean;
  SerialNoCode_X?: number;
  SerialNoCode_Y?: number;
  SerialNoCode_W?: number;
  SerialNoCode_H?: number;
  PrintSerialNoText?: boolean;
  SerialNoText_X?: number;
  SerialNoText_Y?: number;
  SerialNoText_H?: number;

  PrintStockNameText?: boolean;
  StockNameText_X?: number;
  StockNameText_Y?: number;
  StockNameText_H?: number;

  PrintPurchaseDateText?: boolean;
  PurchaseDateText_X?: number;
  PurchaseDateText_Y?: number;
  PurchaseDateText_H?: number;

  PrintVoucherNoText?: boolean;
  VoucherNoText_X?: number;
  VoucherNoText_Y?: number;
  VoucherNoText_H?: number;

  PrintSalePrice?: boolean;
  SalePrice_X?: number;
  SalePrice_Y?: number;
  SalePrice_H?: number;
  PriceBook?: string;

  PrinterType?: string;
  PrinterName?: string;
  PrintSpeed?: number;
  Darkness?: number;
  CustomZPLCommand?: string;
  EnableZPLCommand?: boolean;

  LabelHeight?: number;
  LabelWidth?: number;
  LabelGapH?: number;
  NoOfColumn?: number;
  ColumnWidth?: number;
  LabelGapV?: number;
}>;
export type LabelPrintSettingState = DeepReadonly<{
  url: string;
  printSetting: LabelPrintSetting;
  fetching: boolean;
  saving: boolean;
  error: string;
}>;

const initialSetting: LabelPrintSetting = {
  PrintPIDCode: false,
  PrintPIDCode_X: 0,
  PrintPIDCode_Y: 0,
  PrintPIDCode_W: 0,
  PrintPIDCode_H: 0,
  PrintPIDText: false,
  PIDText_X: 0,
  PIDText_Y: 0,
  PIDText_H: 0,

  PrintStockCodeCode: false,
  StockCode_X: 0,
  StockCode_Y: 0,
  StockCode_W: 0,
  StockCode_H: 0,
  PrintStockCodeText: false,
  StockCodeText_X: 0,
  StockCodeText_Y: 0,
  StockCodeText_H: 0,

  PrintSerialNoCode: false,
  SerialNoCode_X: 0,
  SerialNoCode_Y: 0,
  SerialNoCode_W: 0,
  SerialNoCode_H: 0,
  PrintSerialNoText: false,
  SerialNoText_X: 0,
  SerialNoText_Y: 0,
  SerialNoText_H: 0,

  PrintStockNameText: false,
  StockNameText_X: 0,
  StockNameText_Y: 0,
  StockNameText_H: 0,

  PrintPurchaseDateText: false,
  PurchaseDateText_X: 0,
  PurchaseDateText_Y: 0,
  PurchaseDateText_H: 0,

  PrintVoucherNoText: false,
  VoucherNoText_X: 0,
  VoucherNoText_Y: 0,
  VoucherNoText_H: 0,

  PrintSalePrice: false,
  SalePrice_X: 0,
  SalePrice_Y: 0,
  SalePrice_H: 0,
  PriceBook: "",

  PrinterType: "",
  PrinterName: "",
  PrintSpeed: 0,
  Darkness: 0,
  CustomZPLCommand: "",
  EnableZPLCommand: false,

  LabelHeight: 0,
  LabelWidth: 0,
  LabelGapH: 0,
  NoOfColumn: 0,
  ColumnWidth: 0,
  LabelGapV: 0
};

const initialState: LabelPrintSettingState = {
  url: "http://192.168.100.17:4449",
  printSetting: initialSetting,
  fetching: false,
  saving: false,
  error: ""
};

export type LabelPrintSettingActions =
  | $Call<typeof labelPrintSettingActions.setUrl> & AsyncDispatch
  | $Call<typeof labelPrintSettingActions.loadPrintSetting> & AsyncDispatch
  | $Call<typeof labelPrintSettingActions.savePrintSetting> & AsyncDispatch
  | $Call<typeof labelPrintSettingActions.completeFetchPrintSetting> &
      AsyncDispatch
  | $Call<typeof labelPrintSettingActions.failFetchPrintSetting> & AsyncDispatch
  | $Call<typeof labelPrintSettingActions.completeSavePrintSetting> &
      AsyncDispatch
  | $Call<typeof labelPrintSettingActions.failSavePrintSetting> & AsyncDispatch
  | $Call<typeof labelPrintSettingActions.setPrintSetting> & AsyncDispatch;

export const labelPrintSettingReducer = (
  state: LabelPrintSettingState = initialState,
  action: LabelPrintSettingActions
) => {
  switch (action.type) {
    case getType(labelPrintSettingActions.setUrl):
      return { ...state, url: action.payload };
    case getType(labelPrintSettingActions.loadPrintSetting):
      action.asyncDispatch(showLoading());
      fetch(`${state.url}/api/productserialnolabel/getlabel`)
        .then(response => {
          if (response.status === 200) {
            response.json().then(setting => {
              action.asyncDispatch(
                labelPrintSettingActions.completeFetchPrintSetting(setting)
              );
            });
          } else {
            action.asyncDispatch(
              labelPrintSettingActions.failFetchPrintSetting(
                response.statusText
              )
            );
          }
        })
        .catch(error => {
          action.asyncDispatch(
            labelPrintSettingActions.failFetchPrintSetting(error)
          );
        });
      return { ...state, fetching: true };
    case getType(labelPrintSettingActions.setPrintSetting):
      return {
        ...state,
        printSetting: { ...state.printSetting, ...action.payload }
      };
    case getType(labelPrintSettingActions.completeFetchPrintSetting):
      action.asyncDispatch(hideLoading());
      return {
        ...state,
        printSetting: action.payload,
        fetching: false,
        error: ""
      };
    case getType(labelPrintSettingActions.failFetchPrintSetting):
      action.asyncDispatch(hideLoading());
      return { ...state, fetching: false, error: action.payload };
    case getType(labelPrintSettingActions.savePrintSetting):
      fetch(`${state.url}/api/productserialnolabel/savelabelformat`, {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(state.printSetting)
      })
        .then(response => {
          if (response.status === 204)
            action.asyncDispatch(
              labelPrintSettingActions.completeSavePrintSetting()
            );
          else
            action.asyncDispatch(
              labelPrintSettingActions.failSavePrintSetting(response.statusText)
            );
        })
        .catch(error => {
          action.asyncDispatch(
            labelPrintSettingActions.failSavePrintSetting(error)
          );
        });
      return { ...state, saving: true };
    case getType(labelPrintSettingActions.completeSavePrintSetting):
      action.asyncDispatch(hideLoading());
      action.asyncDispatch(siteActions.openSnackbar("Setting saved!"));
      return { ...state, saving: false };
    case getType(labelPrintSettingActions.failSavePrintSetting):
      action.asyncDispatch(
        siteActions.openSnackbar(`Failed to save setting! ${action.payload}`)
      );
      action.asyncDispatch(hideLoading());
      return { ...state, saving: false, error: action.payload };
    default:
      return state;
  }
};
