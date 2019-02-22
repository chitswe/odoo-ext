import { property } from "lodash";
import Odoo from "../odoo";
const schema = `
type ProductPriceList{
    id:Int!
    name:String!
}

type ProductPriceListConnection implements WithPagination & WithAggregateResult{
    pageInfo:PageInfo!
    edges:[ProductPriceList!]!
    aggregate:AggregateResult!
  }
`;

const resolver = {
  ProductPriceList: {
    id: property("id"),
    name: property("name")
  }
};

const productPriceListFindAll = (
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
  return odoo.execute_kwAsync("product.pricelist", "search_read", filter, {
    offset,
    limit,
    fields: ["name"],
    order
  });
};

const productPriceListCount = (odoo: Odoo, filter: any = [[]]) => {
  return odoo.execute_kwAsync("product.pricelist", "search_count", filter);
};

const productPriceListGetPrice = async (
  odoo: Odoo,
  {
    priceListId,
    productId,
    partnerId
  }: { priceListId?: number; productId?: number; partnerId?: number }
) => {
  const result = await odoo.execute_kwAsync(
    "product.pricelist",
    "web_api_get_product_price",
    [[priceListId], productId, 1, partnerId]
  );
  return result.toString();
};

const priceListFind = (odoo: Odoo, id: number) => {
  const params: any = [[["id", "=", id]]];
  return odoo
    .execute_kwAsync("product.pricelist", "search_read", params, {
      offset: 0,
      limit: 1,
      fields: ["name"]
    })
    .then(([p]: [any]) => p);
};

const priceListRead = (odoo: Odoo, ids: number[]) => {
  return odoo.execute_kwAsync("product.pricelist", "read", [ids], {
    fields: ["name"]
  });
};

export {
  schema,
  resolver,
  productPriceListFindAll,
  productPriceListCount,
  productPriceListGetPrice,
  priceListFind,
  priceListRead
};
