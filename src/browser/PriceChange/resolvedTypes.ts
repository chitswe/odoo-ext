import { PriceChangeQuery, PriceChangeDetailQuery, productListQuery } from "./types";

type PriceChangesType = PriceChangeQuery["price_change"];
type PriceChangeType = PriceChangesType["edges"][number];

type PriceChangeDetailsType = PriceChangeDetailQuery["price_change_detail"];
type PriceChangeDetailType = PriceChangeDetailsType["edges"][number];

type ProductsType = productListQuery["products"];
type ProductType = ProductsType["edges"][number];

export {
    PriceChangesType,
    PriceChangeType,
    PriceChangeDetailsType,
    PriceChangeDetailType,
    ProductsType,
    ProductType
};