import { property } from "lodash";
import Odoo from "../odoo";
import { productFindAll, productCount } from "../MasterData/Product";
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

const generateCSVFile = async (search: string, odoo: Odoo) => {
  const priceLists = await productPriceListFindAll(odoo, {
    offset: 0,
    limit: 100
  });
  const filter = search
    ? [["|", ["default_code", "ilike", search], ["name", "ilike", search]]]
    : [[]];
  const count = 20; // await productCount(odoo, filter);
  const pageSize = 10;
  const newLine = "\r\n";
  let csv =
    "id,Code,Name" + priceLists.map((p: any) => p.name).join(",") + newLine;
  for (let i = 0; i < count; i += pageSize) {
    const products = await productFindAll(odoo, {
      offset: i,
      limit: i + pageSize,
      filter
    });
    products.forEach((p: any) => {
      csv += p.id + ",";
      csv += p.default_code + ",";
      csv += p.name + ",";

      csv += priceLists
        .map(async (price: any) => {
          const value = await productPriceListGetPrice(odoo, {
            partnerId: 1,
            priceListId: price.id,
            productId: p.id
          });
          return value;
        })
        .join(",");

      csv += newLine;
    });
  }
  return csv;
};

export {
  schema,
  resolver,
  productPriceListFindAll,
  productPriceListCount,
  productPriceListGetPrice,
  priceListFind,
  priceListRead,
  generateCSVFile
};
