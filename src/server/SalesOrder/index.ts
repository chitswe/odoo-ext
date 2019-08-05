import { property } from "lodash";
import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { AuthResult } from "../auth";

const schema = `
    type SalesOrder{
        id:Int!
        name:String!
        date_order:DateTime!
        Customer:MasterName!
        SalesPerson:MasterName!
        amount_total:Float!
        InvoiceTotal:Float!
    }

    type SalesOrderConnection implements WithPagination & WithAggregateResult{
        pageInfo:PageInfo!
        edges:[SalesOrder!]!
        aggregate:AggregateResult!
      }
`;

const resolver = {
    SalesOrder : {
        id: property("id"),
        name: property("name"),
        date_order: (order: any) => {
            return new Date(order.date_order);
        },
        Customer: (order: any) => {
            const result = masterNameResolve(
              order.partner_id,
              MasterType.CUSTOMER
            );
            return result;
          },
        SalesPerson: (order: any) => {
            const result = masterNameResolve(
              order.user_id,
              MasterType.USER
            );
            return result;
          },
        amount_total: property("amount_total"),
        InvoiceTotal: (order: any, params: any, context: AuthResult) => {
            let totalAmount = 0;
            let promises = order.invoice_ids.map(async (e: any) => {
                totalAmount += await context.odoo.execute_kwAsync("account.invoice", "search_read", [[["id", "=", e]]], {
                    offset: 0,
                    limit: 1,
                    fields: ["amount_total"]
                })       
                .then(([p]: [any]) => {
                    return p.amount_total;
                });
            });

            return Promise.all(promises).then(() => {
                return totalAmount;
            });
            
        }
    }
};

const salesOrderFindAll = (
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
    return odoo.execute_kwAsync("sale.order", "search_read", filter, {
        offset,
        limit,
        fields: ["id", "name", "date_order", "amount_total", "partner_id", "user_id", "invoice_ids"],
        order
      });
};

const salesOrderCount = (odoo: Odoo, filter: any = [[]]) => {
    return odoo.execute_kwAsync("sale.order", "search_count", filter);
};

const query = {
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
      },
};

export {schema, resolver, query, salesOrderFindAll, salesOrderCount };