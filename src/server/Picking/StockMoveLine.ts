import { property } from "lodash";
import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { productLotFind } from "../ProductLot/index";
import { AuthResult } from "../auth";

const schema = `
    type StockMoveLine{
        id:Int!
        lot_name:ProductLot!
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
    lot_name: (picking: any, params: any, context: AuthResult) => {
      return productLotFind(context.odoo, picking.lot_id[0]);
      // const result = masterNameResolve(picking.lot_id, MasterType.SERIALNO);
      // return result;
    }
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
      fields: ["lot_id"],
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
