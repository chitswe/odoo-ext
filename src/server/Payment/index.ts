import { property } from "lodash";
import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { AuthResult } from "../auth";

const schema = `
    type Payment{
        id:Int!
        PaymentDate:DateTime!
        PaymentNumber:String!
        PaymentType:String!
        partner:MasterName
        journal:MasterName
        Amount:Float!
        createdBy:MasterName!
    }

    type PaymentConnection implements WithPagination & WithAggregateResult{
        pageInfo:PageInfo!
        edges:[Payment!]!
        aggregate:AggregateResult!
    }
`;

const resolver = {
    Payment: {
        id: property("id"),
        PaymentDate: (payment: any) => {
            return new Date(payment.payment_date);
        },
        PaymentNumber: property("communication"),
        PaymentType: property("payment_type"),
        partner: (picking: any) => {
            return masterNameResolve(picking.partner_id, MasterType.PARTNER);
        },
        journal: (payment: any) => {
            const result = masterNameResolve(
                payment.journal_id,
                MasterType.JOURNAL
            );
            return result;
        },
        Amount: property("amount"),
        createdBy: (payment: any) => {
            const result = masterNameResolve(
                payment.create_uid,
                MasterType.USER
            );
            return result;
          },
    }
};

const paymentFindAll = (
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
    return odoo.execute_kwAsync("account.payment", "search_read", filter, {
        offset,
        limit,
        fields: ["id", "payment_date", "communication", "payment_type", "partner_id", "journal_id", "create_uid", "amount", "invoice_ids"],
        order
      });
};

const paymentsByOrderId = async (
    odoo: Odoo,
    {
        filter
      }: {
        filter?: any;
      }
) => {
    let payments: any[] = [];

    let order = await odoo.execute_kwAsync("sale.order", "search_read", filter , {
        offset: 0,
          limit: 1,
          fields: ["invoice_ids"],
        })
        .then(([p]: [any]) => {
          return p;
        });

    let promises = order.invoice_ids.map(async (e: any) => {
        return odoo.execute_kwAsync("account.invoice", "search_read", [[["id", "=", e]]], {
            offset: 0,
            limit: 1,
            fields: ["payment_ids"]
        })       
        .then(([p]: [any]) => {
            let promise1 = p.payment_ids.map(async (m: any) => {
                return odoo.execute_kwAsync("account.payment", "search_read", [[["id", "=", m]]], {
                    offset: 0,
                    limit: 1,
                    fields: ["id", "payment_date", "communication", "payment_type", "partner_id", "journal_id", "create_uid", "amount"],
                })
                .then(([g]: [any]) => {
                    return g;
                });
            });

            return Promise.all(promise1).then((s: any) => {
                return s.map((a: any) => {
                    payments.push(a);
                });
            });

        });
    });

    return Promise.all(promises).then((g) => {
        return payments;
    });
};

const paymentCount = (odoo: Odoo, filter: any = [[]]) => {
    return odoo.execute_kwAsync("account.payment", "search_count", filter);
};

const query = {
    payment : async (
        parent: any,
        params: any,
        context: AuthResult
      ) => {
        const { pageSize = 20, page = 1, order, filter } = params;
        const offset = (page - 1) * pageSize;
        const edges = await paymentFindAll(context.odoo, {
          offset,
          limit: pageSize,
          order,
          filter
        });
        const count = await paymentCount(context.odoo, filter);
        const pageInfo = { hasMore: page * pageSize < count, pageSize, page };
        return {
          edges,
          pageInfo,
          aggregate: {
            count
          }
        };
      },
    payments_by_orderId: async(
        parent: any,
        params: any,
        context: AuthResult
    ) => {
        const { pageSize = 20, page = 1, order, filter } = params;
        const offset = (page - 1) * pageSize;

        const edges = await paymentsByOrderId(context.odoo, { filter });
        const pageInfo = { hasMore: false, pageSize, page };
        return {
          edges,
          pageInfo,
          aggregate: {
            count: edges.length
          }
        };
    }
};

export { schema, resolver, query, paymentFindAll, paymentCount };