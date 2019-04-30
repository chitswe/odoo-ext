import { property } from "lodash";
import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { productLotFind, productLotFindByLotname } from "../ProductLot/index";
import { productQuantFind } from "../ProductQuant/index";
import { AuthResult } from "../auth";
import { stockPickingFind } from "./StockPicking";
import { operationTypeFind  } from "../MasterData/OperationType";

const schema = `
    type StockMoveLine{
        id:Int!
        lot_name:String
        product_lot:ProductLot
        quant:ProductQuant
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
    lot_name: (stockMoveLine: any, params: any, context: AuthResult) => {
      if (stockMoveLine.lot_name)
        return stockMoveLine.lot_name;
      else if (stockMoveLine.lot_id)
        return productLotFind(context.odoo, stockMoveLine.lot_id[0]).then((result) => {
           if (result)
            return result.name;
        });
    },
    product_lot : (stockMoveLine: any, params: any, context: AuthResult) => {
      if (stockMoveLine.lot_id)
        return productLotFind(context.odoo, stockMoveLine.lot_id[0]);
      else if (stockMoveLine.lot_name)
        return productLotFindByLotname(context.odoo, stockMoveLine.lot_name);
      else
        return {id: 0, name: "", product: {}};
    },
    quant: (stockMoveLine: any, params: any, context: AuthResult) => {
      if (stockMoveLine.lot_id) {
        let locationId = stockMoveLine.location_id[0] === 8 || stockMoveLine.location_id[0] === 9 ? stockMoveLine.location_dest_id[0] : stockMoveLine.location_id[0];
        return productQuantFind(context.odoo, stockMoveLine.lot_id[0], locationId);
      }
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
      fields: ["lot_id", "lot_name", "location_id", "location_dest_id"],
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
