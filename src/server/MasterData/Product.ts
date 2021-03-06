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
      id:Int!
      priceList:ProductPriceList!
      price:Float!
      productId: Int!
    }

    type Product{
        id:Int!
        name:String!
        default_code:String!
        barcode:String
        tracking:ProductTracking!
        priceLists(priceListIds:[Int!]!):[ProductPrice]
        available_qty(locations:[Int!]!): Float!
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
    priceLists: (product: any, params: any, context: AuthResult) => {
      return priceListRead(context.odoo, params.priceListIds).then(
        (result: any[]) => {
          return result.map(priceList => ({
            priceList,
            productId: product.id
          }));
        }
      );
    },
    available_qty: (product: any, params: any, context: AuthResult) => {
      return productAvailableQty(context.odoo, {
        product_id: product.id,
        locations: params.locations
      }).then((result: number) => {
        return result;
      });
    }
  },
  ProductPrice: {
    id: (productPrice: any, params: any, context: AuthResult) => {
      const { priceList, productId } = productPrice;
      const textId = `${priceList.id}${productId}`;
      return Number.parseInt(textId, 10);
    },
    priceList: property("priceList"),
    price: (productPrice: any, params: any, context: AuthResult) => {
      const { priceList, productId } = productPrice;
      return productPriceListGetPrice(context.odoo, {
        priceListId: priceList.id,
        productId,
        partnerId: 1
      });
    }
  }
};

const productFind: (
  odoo: Odoo,
  id: number,
  active?: boolean
) => Promise<any> = (odoo: Odoo, id: number, active: boolean = true) => {
  const params: any = [
    [
      ["id", "=", id],
      ["active", "=", active]
    ]
  ];
  return odoo
    .execute_kwAsync("product.product", "search_read", params, {
      offset: 0,
      limit: 1,
      fields: [
        "id",
        "name",
        "default_code",
        "barcode",
        "tracking",
        "available_qty"
      ]
    })
    .then(([p]: [any]) => {
      if (p) return p;
      else return productFind(odoo, id, false);
    });
};

const productAvailableQty = async (
  odoo: Odoo,
  {
    product_id,
    locations
  }: {
    product_id: number;
    locations: [number];
  }
) => {
  const l = !locations.length ? [1] : locations;
  const result = await odoo.execute_kwAsync(
    "product.product",
    "web_api_get_product_available_qty",
    [[product_id], l]
  );
  return result.toString();
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
    fields: ["id", "name", "default_code", "barcode", "tracking"],
    order
  });
};

const productCount = (odoo: Odoo, filter: any = [[]]) => {
  return odoo.execute_kwAsync("product.product", "search_count", filter);
};

const query = {
  product: (parent: any, params: any, context: AuthResult) => {
    return productFind(context.odoo, params.id);
  },
  products: async (parent: any, params: any, context: AuthResult) => {
    const { pageSize = 20, page = 1, order, filter } = params;
    const offset = (page - 1) * pageSize;
    const edges = await productFindAll(context.odoo, {
      offset,
      limit: pageSize,
      order,
      filter
    });
    const count = await productCount(context.odoo, filter);
    const pageInfo = { hasMore: page * pageSize < count, pageSize, page };
    return {
      edges,
      pageInfo,
      aggregate: {
        count
      }
    };
  }
};

export { schema, resolver, query, productFind, productFindAll, productCount };
