import { productPriceListQuery, purchaseOrderLinesQuery } from "./types";

type ProductsType = productPriceListQuery["products"]["edges"];
type ProductType = ProductsType[number];
type PriceListsType = ProductType["priceLists"];
type PriceValueType = PriceListsType[number];
type MasterPriceList = PriceValueType["priceList"];

type OrderLinesType = purchaseOrderLinesQuery["purchase_order_lines"]["edges"];
type OrderLineType = OrderLinesType[number];

export {
  ProductsType,
  ProductType,
  PriceListsType,
  PriceValueType,
  MasterPriceList,
  OrderLineType,
  OrderLinesType
};
