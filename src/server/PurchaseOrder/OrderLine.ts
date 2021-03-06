import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { AuthResult } from "../auth";

const schema = `
type PurchaseOrderLine{
    id:Int!
    date_planned: DateTime!
    price_unit: Float!
    product_name : MasterName!
    product_qty: Float!
    qty_invoiced: Float
    qty_received: Float   
    product_uom: MasterName!
    order_id: MasterName!
}

type PurchaseOrderLineConnection implements WithPagination & WithAggregateResult{
    pageInfo:PageInfo!
    edges:[PurchaseOrderLine!]!
    aggregate:AggregateResult!
  }

`;

const resolver = {
  PurchaseOrderLine: {
    product_name: (orderLine: any) => {
      return masterNameResolve(orderLine.product_id, MasterType.PRODUCT);
    },
    product_uom: (orderLine: any) => {
      return masterNameResolve(orderLine.product_uom, MasterType.UOM);
    },
    order_id: (orderLine: any) => {
      return masterNameResolve(orderLine.order_id, MasterType.PO);
    },
    date_planned: (orderLine: any) => {
      return new Date(orderLine.date_planned);
    }
  }
};

const purchaseOrderLineFindAll = async (
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
  const result = await odoo.execute_kwAsync(
    "purchase.order.line",
    "search_read",
    filter,
    {
      offset,
      limit,
      fields: [
        "date_planned",
        "price_unit",
        "product_id",
        "product_qty",
        "qty_invoiced",
        "qty_received",
        "product_uom",
        "order_id"
      ],
      order
    }
  );
  return result;
};

const purchaseOrderLineCount = (odoo: Odoo, filter: any = [[]]) => {
  return odoo.execute_kwAsync("purchase.order.line", "search_count", filter);
};

const query = {
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
};
export { schema, resolver, query, purchaseOrderLineFindAll, purchaseOrderLineCount };
