import { property } from "lodash";
import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { AuthResult } from "../auth";

const schema = `
    type SalesOrder{
        id:Int!
        OrderNumber:String!
        OrderDate:DateTime!
        Customer:MasterName!
        SalesPerson:MasterName!
        TotalAmount:Float!
        AmountDue:Float!
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
        OrderNumber: property("name"),
        OrderDate: property("date_order"),
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
        TotalAmount: property("amount_total"),
        AmountDue: (order: any, params: any, context: AuthResult) => {
            let totalAmount = 0;
            let promises = order.invoice_ids.map(async (e: any) => {
                totalAmount += await context.odoo.execute_kwAsync("account.invoice", "search_read", [[["id", "=", e]]], {
                    offset: 0,
                    limit: 1,
                    fields: ["residual"]
                })       
                .then(([p]: [any]) => {
                    return p.residual;
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

export {schema, resolver, salesOrderFindAll, salesOrderCount };