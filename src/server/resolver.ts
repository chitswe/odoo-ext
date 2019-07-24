import { GraphQLScalarType } from "graphql";
import { property } from "lodash";
import { Kind } from "graphql/language";
import {
  resolver as picking_resolver,
  query as picking_query
} from "./Picking/StockPicking";
import {
  resolver as product_resolver,
  query as product_query
} from "./MasterData/Product";
import {
  resolver as operation_type_resolver,
  operationTypeFind
} from "./MasterData/OperationType";
import {
  resolver as stock_move_resolver,
  query as stock_move_query
} from "./Picking/StockMove";
import { resolver as master_name_resolver } from "./MasterData/MasterName";
import { resolver as stock_move_line_resolver, mutation as stock_move_line_mutation } from "./Picking/StockMoveLine";
import {
  resolver as product_pricelist_resolver,
  query as product_pricelist_query,
  mutation as product_pricelist_mutation
} from "./PriceList";
import { AuthResult } from "./auth";
import {
  resolver as purchase_order_line_resolver,
  query as purchase_order_line_query
} from "./PurchaseOrder/OrderLine";
import {
  resolver as product_lot_resolver,
  productLotFind
} from "./ProductLot/index";
import {
  resolver as product_quant_resolver
} from "./ProductQuant/index";
import { resolver as sales_order_resolver, query as sales_order_query } from "./SalesOrder/index";
import { resolver as price_change_resolver, query as price_change_query, mutation as price_change_mutation } from "./PriceChange/index";
import { resolver as payment_resolver, query as payment_query } from "./Payment/index";

const coerceAnyString = (value: any) => {
  if (Array.isArray(value)) {
    throw new TypeError(
      `IntString cannot represent an array value: [${String(value)}]`
    );
  }
  if (!Number.isNaN(value)) {
    return value;
  }  
  return String(value);
};

const resolver = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "Date time custom scalar type",
    parseValue(value: string) {
      return new Date(value); // value from the client
    },
    serialize(value: Date) {
      return value.toJSON(); // value sent to the client
    },
    parseLiteral(ast: any) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value); // ast value is always in string format
      }
      return null;
    }
  }),
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value: string) {
      return new Date(value).dateOnly(); // value from the client
    },
    serialize(value: Date) {
      return value.toDateOnlyJSON(); // value sent to the client
    },
    parseLiteral(ast: any) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value); // ast value is always in string format
      }
      return null;
    }
  }),
  AnyString: new GraphQLScalarType({
    name: "AnyString",
    parseValue: coerceAnyString,
    serialize: coerceAnyString,
    parseLiteral(ast: any) {
      if (ast.kind === Kind.INT) {
        return coerceAnyString(parseInt(ast.value, 10));
      }
      if (ast.kind === Kind.FLOAT) {
        return coerceAnyString(parseFloat(ast.value));
      }
      if (ast.kind === Kind.BOOLEAN) {
        return coerceAnyString(ast.value === "true");
      }
      if (ast.kind === Kind.STRING) {
        return ast.value;
      }
      return undefined;
    }
  }),
  Query: {
    hello: async (_: any, params: any, context: AuthResult) => {
      return await context.odoo.connectAsync();
    },
    ...picking_query,
    ...stock_move_query,
    ...product_pricelist_query,
    ...product_query,
    ...purchase_order_line_query,
    ...sales_order_query,
    ...price_change_query,
    ...payment_query    
  },  
  Customer: {
    id: property("id"),
    name: property("name")
  },
  ...picking_resolver,
  ...product_resolver,
  ...stock_move_resolver,
  ...master_name_resolver,
  ...stock_move_line_resolver,
  ...product_pricelist_resolver,
  ...purchase_order_line_resolver,
  ...operation_type_resolver,
  ...product_lot_resolver,
  ...product_quant_resolver,
  ...sales_order_resolver,
  ...price_change_resolver,
  ...payment_resolver,
  Mutation: {
    ...stock_move_line_mutation,
    ...product_pricelist_mutation,
    ...price_change_mutation
  }
};

export default resolver;
