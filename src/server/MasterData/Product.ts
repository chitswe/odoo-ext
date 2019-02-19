import { property } from "lodash";
import Odoo from "../odoo";
const schema = `
    enum ProductTracking{
      serial
      lot
      none
    }
    type Product{
        id:Int!
        name:String!
        default_code:String!
        barcode:String
        tracking:ProductTracking!
    }
`;

const resolver = {
  Product: {
    id: property("id"),
    name: property("name"),
    default_code: property("default_code"),
    barcode: property("barcode"),
    tracking: property("tracking")
  }
};

const productFind = (odoo: Odoo, id: number) => {
  const params: any = [[["id", "=", id]]];
  return odoo
    .execute_kwAsync("product.product", "search_read", params, {
      offset: 0,
      limit: 1,
      fields: ["id", "name", "default_code", "barcode", "tracking"]
    })
    .then(([p]: [any]) => p);
};

export { schema, resolver, productFind };
