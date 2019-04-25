import { property } from "lodash";
import Odoo from "../odoo";

const schema = `
    type OperationType{
        id:Int!
        use_create_lots:Boolean!
        use_existing_lots:Boolean!
    }
`;

const resolver = {
    OperationType : {
        id: property("id"),
        use_create_lots: property("use_create_lots"),
        use_existing_lots: property("use_existing_lots")
    }
};

const operationTypeFind = async (odoo: Odoo, id: number) => {
    const params: any = [[["id", "=", id]]];
    return odoo.execute_kwAsync("stock.picking.type", "search_read", params, {
        offset: 0,
        limit: 1,
        fields: ["id", "use_create_lots", "use_existing_lots"]
    })
    .then(([p]: [any]) => {
        return p;
      });
};

export { schema, resolver, operationTypeFind };