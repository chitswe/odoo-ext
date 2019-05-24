import { GraphQLScalarType } from "graphql";
import { property } from "lodash";
import { Kind } from "graphql/language";
import {
  resolver as picking_resolver,
  stockPickingFind,
  stockPickingCount,
  stockPickingFindAll
} from "./Picking/StockPicking";
import {
  resolver as product_resolver,
  productFind,
  productFindAll,
  productCount
} from "./MasterData/Product";
import {
  resolver as operation_type_resolver,
  operationTypeFind
} from "./MasterData/OperationType";
import {
  resolver as stock_move_resolver,
  stockMoveFindAll
} from "./Picking/StockMove";
import { resolver as master_name_resolver } from "./MasterData/MasterName";
import { resolver as stock_move_line_resolver, mutation as stock_move_line_mutation, stockMoveLineFindAll, stockMoveLineCount } from "./Picking/StockMoveLine";
import {
  resolver as product_pricelist_resolver,
  mutation as product_pricelist_mutation,
  productPriceListFindAll,
  productPriceListCount,
  productPriceListGetPrice,
  priceListFind
} from "./PriceList";
import { AuthResult } from "./auth";
import {
  resolver as purchase_order_line_resolver,
  purchaseOrderLineFindAll,
  purchaseOrderLineCount
} from "./PurchaseOrder/OrderLine";
import {
  resolver as product_lot_resolver,
  productLotFind
} from "./ProductLot/index";
import {
  resolver as product_quant_resolver,
  productQuantFind
} from "./ProductQuant/index";
import { resolver as sales_order_resolver, salesOrderFindAll, salesOrderCount } from "./SalesOrder/index";
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
    picking: (parent: any, params: any, context: AuthResult) => {
      return stockPickingFind(context.odoo, params.id);
    },
    pickings: async (parent: any, params: any, context: AuthResult) => {
      const { pageSize = 20, page = 1, order, filter } = params;
      const offset = (page - 1) * pageSize;
      const edges = await stockPickingFindAll(context.odoo, {
        offset,
        limit: pageSize,
        order,
        filter
      });
      const count = await stockPickingCount(context.odoo, filter);
      const pageInfo = { hasMore: page * pageSize < count, pageSize, page };
      return {
        edges,
        pageInfo,
        aggregate: {
          count
        }
      };
    },
    stock_move: async (parent: any, params: any, context: AuthResult) => {
      const stockMoves = await stockMoveFindAll(context.odoo, {
        offset: 0,
        limit: 1,
        filter: [[["id", "=", params.id]]]
      });
      const [stockMove] = stockMoves;
      return stockMove;
    },
    pricelists: async (parent: any, params: any, context: AuthResult) => {
      const { pageSize = 20, page = 1, order, filter } = params;
      const offset = (page - 1) * pageSize;
      const edges = await productPriceListFindAll(context.odoo, {
        offset,
        limit: pageSize,
        order,
        filter
      });
      const count = await productPriceListCount(context.odoo, filter);
      const pageInfo = { hasMore: page * pageSize < count, pageSize, page };
      return {
        edges,
        pageInfo,
        aggregate: {
          count
        }
      };
    },
    getprice: async (parent: any, params: any, context: AuthResult) => {
      const { productId, priceListId, partnerId } = params;
      return productPriceListGetPrice(context.odoo, {
        priceListId,
        productId,
        partnerId
      });
    },
    product: (parent: any, params: any, context: AuthResult) => {
      return productFind(context.odoo, params.id);
    },
    products: async (parent: any, params: any, context: AuthResult) => {
      const { pageSize = 20, page = 1, order, filter } = params;
      const offset = (page - 1) * pageSize;
      const edges = await productFindAll(context.odoo, {
        offset,
        limit: pageSize,
        order,
        filter
      });
      const count = await productCount(context.odoo, filter);
      const pageInfo = { hasMore: page * pageSize < count, pageSize, page };
      return {
        edges,
        pageInfo,
        aggregate: {
          count
        }
      };
    },
    purchase_order_lines: async (
      parent: any,
      params: any,
      context: AuthResult
    ) => {
      const { pageSize = 20, page = 1, order, filter } = params;
      const offset = (page - 1) * pageSize;
      const edges = await purchaseOrderLineFindAll(context.odoo, {
        offset,
        limit: pageSize,
        order,
        filter
      });
      const count = await purchaseOrderLineCount(context.odoo, filter);
      const pageInfo = { hasMore: page * pageSize < count, pageSize, page };
      return {
        edges,
        pageInfo,
        aggregate: {
          count
        }
      };
    },
    sales_order : async (
      parent: any,
      params: any,
      context: AuthResult
    ) => {
      const { pageSize = 20, page = 1, order, filter } = params;
      const offset = (page - 1) * pageSize;
      const edges = await salesOrderFindAll(context.odoo, {
        offset,
        limit: pageSize,
        order,
        filter
      });
      const count = await salesOrderCount(context.odoo, filter);
      const pageInfo = { hasMore: page * pageSize < count, pageSize, page };
      return {
        edges,
        pageInfo,
        aggregate: {
          count
        }
      };
    }
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

  Mutation: {
    ...stock_move_line_mutation,
    ...product_pricelist_mutation
  }
};

export default resolver;
