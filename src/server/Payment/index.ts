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
        fields: ["id", "payment_date", "communication", "payment_type", "partner_id", "journal_id", "create_uid", "amount"],
        order
      });
};

const paymentCount = (odoo: Odoo, filter: any = [[]]) => {
    return odoo.execute_kwAsync("account.payment", "search_count", filter);
};

export { schema, resolver, paymentFindAll, paymentCount };