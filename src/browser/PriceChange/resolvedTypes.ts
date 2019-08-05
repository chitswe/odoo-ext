import { PriceChangeQuery, PriceChangeDetailQuery } from "./types";

type PriceChangesType = PriceChangeQuery["price_change"];
type PriceChangeType = PriceChangesType["edges"][number];

type PriceChangeDetailsType = PriceChangeDetailQuery["price_change_detail"];
type PriceChangeDetailType = PriceChangeDetailsType["edges"][number];

export {
    PriceChangesType,
    PriceChangeType,
    PriceChangeDetailsType,
    PriceChangeDetailType
};