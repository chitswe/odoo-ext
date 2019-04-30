import { property } from "lodash";
import Odoo from "../odoo";
import { productFind } from "../MasterData/Product";
import { AuthResult } from "../auth";

const schema = `
    type ProductLot {
        id:Int!
        name:String!
        product:Product!
        product_qty:Int
        created:Boolean
    }
`;

const resolver = {
    ProductLot : {
        id: property("id"),
        name: property("name"),
        product: (lot: any, params: any, context: AuthResult) => {
            return productFind(context.odoo, lot.product_id[0]);
        },
        product_qty: property("product_qty"),
        created: (lot: any) => {
            return lot.id ? true : false;
        }
    }
};

const productLotFind = (odoo: Odoo, id: number) => {
    const params: any = [[["id", "=", id]]];
    return odoo.execute_kwAsync("stock.production.lot", "search_read", params, {
        offset: 0,
        limit: 1,
        fields: ["id", "name", "product_id", "product_qty"]
    })
    .then(([p]: [any]) => {
        return p;
    });
};

const productLotFindByLotname = (odoo: Odoo, lotname: string) => {
    const params: any = [[["name", "=", lotname]]];
    return odoo.execute_kwAsync("stock.production.lot", "search_read", params, {
        offset: 0,
        limit: 1,
        fields: ["id", "name", "product_id", "product_qty"]
    })
    .then(([p]: [any]) => {
        return p;
    });
};

const productLotFindByProductId = (odoo: Odoo, productId: number) => {
    const params: any = [[["product_id", "=", productId]]];
    return odoo.execute_kwAsync("stock.production.lot", "search_read", params, {
        offset: 0,
        limit: 20,
        fields: ["id", "name", "product_id"]
    });
};

export { schema, resolver, productLotFindByProductId, productLotFind, productLotFindByLotname };