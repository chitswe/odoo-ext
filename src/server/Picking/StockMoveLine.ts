import { property } from "lodash";
import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { productLotFind, productLotFindByLotname } from "../ProductLot/index";
import { productQuantFind } from "../ProductQuant/index";
import { productFind } from "../MasterData/Product";
import { stockMoveFind } from "./StockMove";
import { AuthResult } from "../auth";
import { stockPickingFind } from "./StockPicking";
import { operationTypeFind  } from "../MasterData/OperationType";
import { UserInputError } from "apollo-server";

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
      fields: ["lot_id", "lot_name", "location_id", "location_dest_id", "qty_done"],
      order
    })
    .then((result: any) => {
      return result;
    });
};

const stockMoveLineCount = (odoo: Odoo, filter: any = [[]]) => {
  return odoo.execute_kwAsync("stock.move.line", "search_count", filter);
};

const query = {
  
};

const mutation  = {
  changeProductLot: async ( parent: any, params: any, context: AuthResult) => {
    const { id, pickingId, lotname } = params;
    const picking = await stockPickingFind(context.odoo, pickingId);
    const opType = await operationTypeFind(context.odoo, picking.picking_type_id[0]);
    if (opType.use_create_lots && picking.state === "assigned") {
        return context.odoo.execute_kwAsync(
          "stock.move.line",
          "write",
          [[id], { lot_name: lotname, product_uom_qty: 1, qty_done: 1 }]
        ).then(() => {
          return context.odoo.execute_kwAsync("stock.move.line", "search_read", [[["id", "=", id]]], {
            offset: 0,
            limit: 1,
            fields: ["id", "lot_id", "lot_name", "location_id", "location_dest_id"],
          })
          .then(([p]: [any]) => {
            return p;
          });
        });
    } else if (opType.use_existing_lots && picking.state === "assigned") {
        return productLotFindByLotname(context.odoo, lotname).then((lot) => {
          if (lot)
            return context.odoo.execute_kwAsync(
              "stock.move.line",
              "write",
              [[id], { lot_name: lotname, product_uom_qty: 1, qty_done: 1 }]
            ).then(() => {
              return context.odoo.execute_kwAsync("stock.move.line", "search_read", [[["id", "=", id]]], {
                offset: 0,
                limit: 1,
                fields: ["id", "lot_id", "lot_name", "location_id", "location_dest_id"],
              })
              .then(([p]: [any]) => {
                return p;
              });
            });
            else
              throw new UserInputError("Lotname was not found in existing Product Lot list.", { invalidArgs: { lotname } });
        });
    }  
  },
  generateProductLot : async ( parent: any, params: any, context: AuthResult) => {
    const { pickingId, moveId } = params;
    let lotnum = Number((new Date()).format("YYMMDDhhmmssS001"));
    const picking = await stockPickingFind(context.odoo, pickingId);
    const opType = await operationTypeFind(context.odoo, picking.picking_type_id[0]);
    const move = await stockMoveFind(context.odoo, moveId);
    if (opType.use_create_lots && picking.state === "assigned") {
          const filter: any = [[["move_id", "=", moveId]]];
          const stockMoveLines = await stockMoveLineFindAll(context.odoo, {
            offset: 0,
            limit: 50,
            filter
          });

          if (stockMoveLines.length < move.product_uom_qty) {
            for (let i = stockMoveLines.length; i < move.product_uom_qty; i ++) {
              stockMoveLines.push({id: null, lot_name: null});
            }
          }

          const promiseAll = stockMoveLines.map((lot: any, index: number) => {
            const {id, lot_id, lot_name, location_id, location_dest_id} = lot;
            if ( lot_name || lot_id)
              return {id, lot_id, lot_name, location_id, location_dest_id} ;          
            else {
              if (id)                
                return context.odoo.execute_kwAsync(
                  "stock.move.line",
                  "write",
                  [[id], { lot_name: lotnum + index, product_uom_qty: 1, qty_done: 1 }]
                );
              else
                return context.odoo.execute_kwAsync("stock.move.line", "create", [
                  {
                    move_id: moveId, 
                    date: new Date(), 
                    location_dest_id: picking.location_dest_id[0], 
                    location_id: picking.location_id[0], 
                    product_id: move.product_id[0], 
                    product_uom_id: move.product_uom[0] , 
                    lot_name: lotnum + index, 
                    product_uom_qty: 1, 
                    qty_done: 1
                  }
                ]);             
            }            
          });

          return Promise.all(promiseAll)
          .then(() => {
            return stockMoveLineFindAll(context.odoo, {
              offset: 0,
              limit: 50,
              filter
            }).then((edges) => {
              const pageInfo = { hasMore: false, pageSize: 50, page: 1 };
              return {
                edges,
                pageInfo,
                aggregate: {
                  count: edges.length
                }
              };
            });
          });            
    }
  },
  createStockMoveLine : async ( parent: any, params: any, context: AuthResult) => {
    const { move_id, lot_name } = params;
    const move = await stockMoveFind(context.odoo, move_id);
    const picking = await stockPickingFind(context.odoo, move.picking_id[0]);
    const opType = await operationTypeFind(context.odoo, picking.picking_type_id[0]);
    if (opType.use_create_lots && picking.state === "assigned") {      
      return context.odoo.execute_kwAsync("stock.move.line", "create", [
        {
          move_id, date: new Date(), location_dest_id: picking.location_dest_id[0], location_id: picking.location_id[0], product_id: move.product_id[0], product_uom_id: move.product_uom[0] , lot_name, product_uom_qty: 1, qty_done: 1}
      ]).then((result) => {
        return context.odoo.execute_kwAsync("stock.move.line", "search_read", [[["id", "=", result]]], {
          offset: 0,
          limit: 1,
          fields: ["id", "lot_id", "lot_name", "location_id", "location_dest_id"],
        })
        .then(([p]: [any]) => {
          return p;
        });
      });
    } else if (opType.use_existing_lots && picking.state === "assigned") { 
      return productLotFindByLotname(context.odoo, lot_name).then((lot) => {
        if (lot)
          return context.odoo.execute_kwAsync("stock.move.line", "create", [
            {
              move_id, date: new Date(), location_dest_id: picking.location_dest_id[0], location_id: picking.location_id[0], product_id: move.product_id[0], product_uom_id: move.product_uom[0] , lot_name, product_uom_qty: 1, qty_done: 1}
          ]).then((result) => {
            return context.odoo.execute_kwAsync("stock.move.line", "search_read", [[["id", "=", result]]], {
              offset: 0,
              limit: 1,
              fields: ["id", "lot_id", "lot_name", "location_id", "location_dest_id"],
            })
            .then(([p]: [any]) => {
              return p;
            });
          });
        else
          throw new UserInputError("Lotname was not found in existing Product Lot list.", { invalidArgs: { lot_name } });
        //   return ({lot , error: "ProductLot error!"});
      }); 
    }
  },
  deleteStockMoveLine : async ( parent: any, params: any, context: AuthResult) => {
    const { id } = params;    
    return context.odoo.execute_kwAsync("stock.move.line", "unlink", [id]).then(() => {
      return {id};
    });
  }
};

export { schema, resolver, mutation, stockMoveLineFindAll, stockMoveLineCount };