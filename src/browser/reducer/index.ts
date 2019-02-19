import { loadingBarReducer } from "react-redux-loading-bar";
import { combineReducers } from "redux";
import { SiteActions, SiteState, siteReducer } from "./site";
import {
  StockPickingState,
  stockPickingReducer,
  StockPickingActions
} from "./stockPicking";
import { LabelPrintSettingActions, labelPrintSettingReducer, LabelPrintSettingState } from "./labelPrintSetting";

export type RootAction = SiteActions | StockPickingActions | LabelPrintSettingActions;

export type AsyncDispatch = {
  asyncDispatch?: (asyncAction: RootAction) => void;
};

interface StoreEnhancerState {}

export interface RootState extends StoreEnhancerState {
  site: SiteState;
  loadingBar: any;
  stockPicking: StockPickingState;
  labelPrintSetting: LabelPrintSettingState;
}

export const rootReducer = combineReducers<RootState>({
  loadingBar: loadingBarReducer,
  site: siteReducer,
  stockPicking: stockPickingReducer,
  labelPrintSetting: labelPrintSettingReducer
});
