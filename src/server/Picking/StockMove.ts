import { property } from "lodash";
import { productFind } from "../MasterData/Product";
import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { stockMoveLineFindAll, stockMoveLineCount } from "./StockMoveLine";
import { AuthResult } from "../auth";
const schema = `
    type StockMove{
        id:Int!
        product_uom_qty:Int
        quantity_done:Int
        product:Product!
        product_name: MasterName!
        product_uom: MasterName!
        move_lines(page:Int=1, pageSize:Int=20,order:String): StockMoveLineConnection
    }

    type StockMoveConnection implements WithPagination & WithAggregateResult{
      pageInfo:PageInfo!
      edges:[StockMove!]!
      aggregate:AggregateResult!
    }
`;

const resolver = {
  StockMove: {
    id: property("id"),
    product: (move: any, params: any, context: AuthResult) => {
      return productFind(context.odoo, move.product_id[0]);
    },
    product_uom_qty: property("product_uom_qty"),
    quantity_done: property("quantity_done"),
    product_name: (move: any) => {
      return masterNameResolve(move.product_id, MasterType.PRODUCT);
    },
    move_lines: async (move: any, params: any, context: AuthResult) => {
      const { pageSize = 20, page = 1, order } = params;
      const _offset = (page - 1) * pageSize;
      const filter: any = [[["move_id", "=", move.id]]];
      const product = await productFind(context.odoo, move.product_id[0]);
      const isSerialTracking = product && (product.tracking === "serial" || product.tracking === "lot");
      const edges = isSerialTracking
        ? await stockMoveLineFindAll(context.odoo, {
            offset: _offset,
            limit: pageSize,
            order,
            filter
          })
        : [];
      const count = isSerialTracking ? await stockMoveLineCount(context.odoo,filter) : 0;
      const pageInfo = { hasMore: page * pageSize < count, pageSize, page };
      return {
        edges,
        pageInfo,
        aggregate: {
          count
        }
      };
    },
    product_uom: (move: any) => {
      return masterNameResolve(move.product_uom, MasterType.UOM);
    }
  }
};

const stockMoveFindAll = (
  odoo: Odoo,
  {
    offset,
    limit,
    order,
    filter
  }: {
    offset: number;
    limit: number;
    order?: string;
    filter?: any;
  }
) => {
  return odoo.execute_kwAsync("stock.move", "search_read", filter, {
    offset,
    limit,
    fields: ["product_uom_qty", "quantity_done", "product_id", "product_uom"],
    order
  });
};

const stockMoveFind = (odoo: Odoo, id: number) => {
  const params: any = [[["id", "=", id]]];
  return odoo.execute_kwAsync("stock.move", "search_read", params, {
    offset: 0,
      limit: 1,
      fields: ["product_uom_qty", "quantity_done", "product_id", "product_uom", "picking_id"]
    })
    .then(([p]: [any]) => {
      return p;
    });     
};

const stockMoveCount = (odoo: Odoo, filter: any = [[]]) => {
  return odoo.execute_kwAsync("stock.move", "search_count", filter);
};

export { schema, resolver, stockMoveFindAll, stockMoveFind, stockMoveCount };
