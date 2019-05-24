/* tslint:disable */
//  This file was automatically generated and should not be edited.

export interface SalesOrderQueryVariables {
  page?: number | null,
  pageSize?: number | null,
  order?: string | null,
  filter?: Array< Array< Array< string > > > | null,
};

export interface SalesOrderQuery {
  sales_order:  {
    __typename: "SalesOrderConnection",
    pageInfo:  {
      __typename: "PageInfo",
      hasMore: boolean,
      page: number,
      pageSize: number,
    },
    aggregate:  {
      __typename: "AggregateResult",
      count: number | null,
    },
    edges:  Array< {
      __typename: "SalesOrder",
      id: number,
      OrderNumber: string,
      Customer:  {
        __typename: "MasterName",
        name: string,
      },
      SalesPerson:  {
        __typename: "MasterName",
        name: string,
      },
      TotalAmount: number,
      AmountDue: number,
    } >,
  } | null,
};
