import { property } from "lodash";
import Odoo from "../odoo";
import { AuthResult } from "../auth";
import { priceListRead, productPriceListGetPrice } from "../PriceList";
const schema = `
    enum ProductTracking{
      serial
      lot
      none
    }

    type ProductPrice{
      PriceList:ProductPriceList!
      price:Float!
    }

    type Product{
        id:Int!
        name:String!
        default_code:String!
        barcode:String
        tracking:ProductTracking!
        price(priceListIds:[Int!]!):[ProductPrice]
    }

    type ProductConnection implements WithPagination & WithAggregateResult{
      pageInfo:PageInfo!
      edges:[Product!]!
      aggregate:AggregateResult!
    }
`;

const resolver = {
  Product: {
    id: property("id"),
    name: property("name"),
    default_code: property("default_code"),
    barcode: property("barcode"),
    tracking: property("tracking"),
    price: (product: any, params: any, context: AuthResult) => {
      return priceListRead(context.odoo, params.priceListIds).then(
        (result: any[]) => {
          return result.map(pricelist => ({
            PriceList: pricelist,
            productId: product.id
          }));
        }
      );
    }
  },
  ProductPrice: {
    PriceList: property("PriceList"),
    price: (productPrice: any, params: any, context: AuthResult) => {
      const { PriceList, productId } = productPrice;
      return productPriceListGetPrice(context.odoo, {
        priceListId: PriceList.id,
        productId,
        partnerId: 1
      });
    }
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

const productFindAll = (
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
  return odoo.execute_kwAsync("product.product", "search_read", filter, {
    offset,
    limit,
    fields:  ["id", "name", "default_code", "barcode", "tracking"],
    order
  });
};

const productCount = (odoo: Odoo, filter: any = [[]]) => {
  return odoo.execute_kwAsync("product.product", "search_count", filter);
};

export { schema, resolver, productFind , productFindAll, productCount};
