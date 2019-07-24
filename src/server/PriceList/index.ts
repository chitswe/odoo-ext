import { property } from "lodash";
import Odoo from "../odoo";
import { AuthResult } from "../auth";
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

const query = {
  pricelists: async (parent: any, params: any, context: AuthResult) => {
    const { pageSize = 20, page = 1, order, filter } = params;
    const offset = (page - 1) * pageSize;
    const edges = await productPriceListFindAll(context.odoo, {
      offset,
      limit: pageSize,
      order,
      filter
    });
    const count = await productPriceListCount(context.odoo, filter);
    const pageInfo = { hasMore: page * pageSize < count, pageSize, page };
    return {
      edges,
      pageInfo,
      aggregate: {
        count
      }
    };
  },
  getprice: async (parent: any, params: any, context: AuthResult) => {
    const { productId, priceListId, partnerId } = params;
    return productPriceListGetPrice(context.odoo, {
      priceListId,
      productId,
      partnerId
    });
  },
};

const mutation = {
  changePrice: async (parent: any, params: any, context: AuthResult) => {
    const { productId, priceListId, price } = params;
    const priceListItems = await context.odoo.execute_kwAsync(
      "product.pricelist.item",
      "search",
      [
        [
          ["pricelist_id", "=", priceListId],
          ["product_id", "=", productId],
          ["applied_on", "=", "0_product_variant"],
          ["base", "=", "list_price"]
        ]
      ]
    );
    const [itemId] = priceListItems;
    if (priceListId === 1) {
      await context.odoo.execute_kwAsync(
        "product.product",
        "write",
        [[productId], { lst_price: price }]
      );
    }
    if (itemId) {
      const result = await context.odoo.execute_kwAsync(
        "product.pricelist.item",
        "write",
        [[itemId], { fixed_price: price }]
      );
    } else {
      const result = await context.odoo.execute_kwAsync(
        "product.pricelist.item",
        "create",
        [
          {
            applied_on: "0_product_variant",
            pricelist_id: priceListId,
            product_id: productId,
            fixed_price: price,
            base: "list_price"
          }
        ]
      );
    }
    const priceList = await priceListFind(context.odoo, priceListId);
    return { priceList, productId };
  }
};

export {
  schema,
  resolver,
  query,
  mutation,
  productPriceListFindAll,
  productPriceListCount,
  productPriceListGetPrice,
  priceListFind,
  priceListRead,
  generateCSVFile
};
