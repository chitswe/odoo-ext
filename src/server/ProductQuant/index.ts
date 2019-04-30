import { property } from "lodash";
import Odoo from "../odoo";
import { productFind } from "../MasterData/Product";
import { AuthResult } from "../auth";

const schema = `
    type ProductQuant {
        id:Int!
        location_id:Int!
        quantity:Int!
    }
`;

const resolver = {
    ProductQuant : {
        id: property("id"),
        location_id: property("location_id"),
        quantity: property("quantity")
    }
};

const productQuantFind = (odoo: Odoo, lotid: number, locationId: number) => {
    const params: any = [[["lot_id", "=", lotid], ["location_id", "=", locationId]]];
    return odoo.execute_kwAsync("stock.quant", "search_read", params, {
        offset: 0,
        limit: 1,
        fields: ["id", "location_id", "quantity"]
    })
    .then(([p]: [any]) => {
        return p;
    });
};

export { schema, resolver, productQuantFind};