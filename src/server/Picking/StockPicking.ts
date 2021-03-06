import { property } from "lodash";
import { stockMoveFindAll, stockMoveCount, stockMoveFind } from "./StockMove";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { operationTypeFind } from "../MasterData/OperationType";
import Odoo from "../odoo";
import { AuthResult } from "../auth";
const schema = `
    enum PickingState{
      draft
      waiting
      confirmed
      assigned
      done
      cancel
    }
    type StockPicking{
        id:Int!
        name:String!
        location_dest:MasterName!
        location:MasterName!
        stock_moves(page:Int=1,pageSize:Int=20,order:String):StockMoveConnection
        stock_move(id:Int):StockMove
        partner:MasterName
        scheduled_date:DateTime!
        origin:String
        state:PickingState!
        picking_type:MasterName!  
        operation_type:OperationType!      
    }

    type StockPickingConnection implements WithPagination & WithAggregateResult{
        pageInfo:PageInfo!
        edges:[StockPicking!]!
        aggregate:AggregateResult!
    }
`;

const resolver = {
  StockPicking: {
    id: property("id"),
    name: property("name"),
    stock_moves: async (picking: any, params: any, context: AuthResult) => {
      const { pageSize = 20, page = 1, order } = params;
      const _offset = (page - 1) * pageSize;
      const filter: any = [[["picking_id", "=", picking.id]]];
      const edges = await stockMoveFindAll(context.odoo, {
        offset: _offset,
        limit: pageSize,
        order,
        filter
      });
      const count = await stockMoveCount(context.odoo, filter);
      const pageInfo = { hasMore: page * pageSize < count, pageSize, page };
      return {
        edges,
        pageInfo,
        aggregate: {
          count
        }
      };
    },
    stock_move: async (picking: any, params: any, context: AuthResult) => {
      return stockMoveFind(context.odoo, params.id);
    },
    location_dest: (picking: any) => {
      const result = masterNameResolve(
        picking.location_dest_id,
        MasterType.WAREHOUSE
      );
      return result;
    },
    partner: (picking: any) => {
      return masterNameResolve(picking.partner_id, MasterType.PARTNER);
    },
    scheduled_date: (picking: any) => {
      return new Date(picking.scheduled_date);
    },
    origin: property("origin"),
    state: property("state"),
    picking_type: (picking: any) => {
      return masterNameResolve(
        picking.picking_type_id,
        MasterType.STOCK_OPERATION
      );
    },
    operation_type: (picking: any, params: any, context: AuthResult) => {
      return operationTypeFind(context.odoo, picking.picking_type_id[0]);
    },
    location: (picking: any) => {
      return masterNameResolve(picking.location_id, MasterType.WAREHOUSE);
    }
  }
};

const stockPickingCount = (odoo: Odoo, filter: any = [[]]) => {
  return odoo.execute_kwAsync("stock.picking", "search_count", filter);
};

const stockPickingFind = async (odoo: Odoo, id: number) => {
  const records = await odoo.execute_kwAsync("stock.picking", "read", [id], {
    fields: [
      "name",
      "location_dest_id",
      "partner_id",
      "scheduled_date",
      "origin",
      "state",
      "picking_type_id",
      "location_id"
    ]
  });
  return records[0];
};

const stockPickingFindAll = (
  odoo: Odoo,
  {
    offset,
    limit,
    order,
    filter = [[]]
  }: {
    offset: number;
    limit: number;
    order?: string;
    filter?: any;
  }
) => {
  return odoo.execute_kwAsync("stock.picking", "search_read", filter, {
    offset,
    limit,
    fields: [
      "name",
      "location_dest_id",
      "partner_id",
      "scheduled_date",
      "origin",
      "state",
      "picking_type_id",
      "location_id"
    ],
    order
  });
};

const query = {
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
  }
};

export {
  schema,
  resolver,
  query,
  stockPickingFindAll,
  stockPickingCount,
  stockPickingFind
};
