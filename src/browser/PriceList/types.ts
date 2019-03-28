/* tslint:disable */
//  This file was automatically generated and should not be edited.

export interface getPriceListsQuery {
  pricelists:  {
    __typename: "ProductPriceListConnection",
    edges:  Array< {
      __typename: "ProductPriceList",
      id: number,
      name: string,
    } >,
  } | null,
};

export interface productForPriceListQueryVariables {
  productId: number,
  priceListIds: Array< number >,
};

export interface productForPriceListQuery {
  product:  {
    __typename: "Product",
    id: number,
    name: string,
    default_code: string,
    priceLists:  Array< {
      __typename: "ProductPrice",
      id: number,
      price: number,
      priceList:  {
        __typename: "ProductPriceList",
        id: number,
        name: string,
      },
    } | null > | null,
  } | null,
};

export interface purchaseOrderLinesQueryVariables {
  page?: number | null,
  pageSize?: number | null,
  order?: string | null,
  filter?: Array< Array< Array< string > > > | null,
};

export interface purchaseOrderLinesQuery {
  purchase_order_lines:  {
    __typename: "PurchaseOrderLineConnection",
    pageInfo:  {
      __typename: "PageInfo",
      page: number,
      pageSize: number,
      hasMore: boolean,
    },
    aggregate:  {
      __typename: "AggregateResult",
      count: number | null,
    },
    edges:  Array< {
      __typename: "PurchaseOrderLine",
      id: number,
      product_uom:  {
        __typename: "MasterName",
        id: string,
        name: string,
      },
      product_name:  {
        __typename: "MasterName",
        id: string,
        name: string,
      },
      product_qty: number,
      price_unit: number,
      order_id:  {
        __typename: "MasterName",
        id: string,
        name: string,
      },
      date_planned: string,
    } >,
  } | null,
};

export interface productPriceListQueryVariables {
  page?: number | null,
  pageSize?: number | null,
  order?: string | null,
  filter?: Array< Array< Array< string > > > | null,
  priceListIds: Array< number >,
};

export interface productPriceListQuery {
  products:  {
    __typename: "ProductConnection",
    edges:  Array< {
      __typename: "Product",
      id: number,
      name: string,
      default_code: string,
      priceLists:  Array< {
        __typename: "ProductPrice",
        id: number,
        price: number,
        priceList:  {
          __typename: "ProductPriceList",
          id: number,
          name: string,
        },
      } | null > | null,
    } >,
    pageInfo:  {
      __typename: "PageInfo",
      page: number,
      pageSize: number,
      hasMore: boolean,
    },
    aggregate:  {
      __typename: "AggregateResult",
      count: number | null,
    },
  } | null,
};

export interface changePriceMutationVariables {
  productId: number,
  priceListId: number,
  price: number,
};

export interface changePriceMutation {
  changePrice:  {
    __typename: "ProductPrice",
    id: number,
    price: number,
    priceList:  {
      __typename: "ProductPriceList",
      id: number,
      name: string,
    },
    productId: number,
  } | null,
};
