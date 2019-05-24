import { SalesOrderQuery } from "./types";

type SalesOrdersType = SalesOrderQuery["sales_order"]["edges"];
type SalesOrderType = SalesOrdersType[number];

export {
    SalesOrdersType,
    SalesOrderType
};