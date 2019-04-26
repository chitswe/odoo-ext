import { property } from "lodash";
import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { productLotFind, productLotFindByLotname } from "../ProductLot/index";
import { AuthResult } from "../auth";

const schema = `
    type StockMoveLine{
        id:Int!
        lot_name:String!
        qty:Int!        
    }
    type StockMoveLineConnection implements WithPagination & WithAggregateResult{
      pageInfo:PageInfo!
      edges:[StockMoveLine!]!
      aggregate:AggregateResult!
    }
`;

const resolver = {
  StockMoveLine: {
    id: property("id"),
    lot_name: property("lot_name"),
    qty: (stockMoveLine: any, params: any, context: AuthResult) => {
      if (stockMoveLine.lot_id)
        return productLotFind(context.odoo, stockMoveLine.lot_id[0]).then((result) => {
          return result.product_qty;
        });
      else
        return productLotFindByLotname(context.odoo, stockMoveLine.lot_name).then((result) => {
          if (result)
            return result.product_qty;
          else
            return 0;
        });
    }
    // lot_name: (stockMoveLine: any, params: any, context: AuthResult) => {
    //   return productLotFind(context.odoo, stockMoveLine.lot_id[0]);      
    // }
  }
};

const stockMoveLineFindAll = (
  odoo: Odoo,
  {
    offset,
    limit,
    filter,
    order
  }: {
    offset: number;
    limit: number;
    filter?: any;
    order?: string;
  }
) => {
  return odoo
    .execute_kwAsync("stock.move.line", "search_read", filter, {
      offset,
      limit,
      fields: ["lot_id", "lot_name"],
      order
    })
    .then((result: any) => {
      return result;
    });
};

const stockMoveLineCount = (odoo: Odoo, filter: any = [[]]) => {
  return odoo.execute_kwAsync("stock.move.line", "search_count", filter);
};

export { schema, resolver, stockMoveLineFindAll, stockMoveLineCount };
