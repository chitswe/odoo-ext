import { loadingBarReducer } from "react-redux-loading-bar";
import { combineReducers } from "redux";
import { SiteActions, SiteState, siteReducer } from "./site";
import {
  StockPickingState,
  stockPickingReducer,
  StockPickingActions
} from "./stockPicking";
import {  StockMoveState, stockMoveReducer, StockMoveActions } from "./stockMove";
import { LabelPrintSettingActions, labelPrintSettingReducer, LabelPrintSettingState } from "./labelPrintSetting";
import { priceListReducer, PriceListState, PriceListActions } from "./priceList";
import { priceChangeReducer, PriceChangeState, PriceChangeActions } from "./priceChange";
import { priceChangeDetailReducer, PriceChangeDetailState, PriceChangeDetailActions } from "./priceChangeDetail";

export type RootAction = SiteActions | StockPickingActions | LabelPrintSettingActions | PriceListActions | PriceChangeActions | PriceChangeDetailActions;

export type AsyncDispatch = {
  asyncDispatch?: (asyncAction: RootAction) => void;
};

interface StoreEnhancerState {}

export interface RootState extends StoreEnhancerState {
  site: SiteState;
  loadingBar: any;
  stockPicking: StockPickingState;
  labelPrintSetting: LabelPrintSettingState;
  priceList: PriceListState;
  priceChange: PriceChangeState;
  priceChangeDetail: PriceChangeDetailState;
  stockMove: StockMoveState;
}

export const rootReducer = combineReducers<RootState>({
  loadingBar: loadingBarReducer,
  site: siteReducer,
  stockPicking: stockPickingReducer,
  labelPrintSetting: labelPrintSettingReducer,
  priceList: priceListReducer,
  priceChange: priceChangeReducer,
  priceChangeDetail: priceChangeDetailReducer,
  stockMove: stockMoveReducer
});
