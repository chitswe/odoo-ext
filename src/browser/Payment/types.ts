/* tslint:disable */
//  This file was automatically generated and should not be edited.

export interface PaymentQueryVariables {
  page?: number | null,
  pageSize?: number | null,
  order?: string | null,
  filter?: Array< Array< Array< string > > > | null,
};

export interface PaymentQuery {
  payment:  {
    __typename: "PaymentConnection",
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
      __typename: "Payment",
      id: number,
      PaymentDate: string,
      PaymentNumber: string,
      PaymentType: string,
      partner:  {
        __typename: "MasterName",
        id: string,
        name: string,
      } | null,
      journal:  {
        __typename: "MasterName",
        id: string,
        name: string,
      } | null,
      createdBy:  {
        __typename: "MasterName",
        id: string,
        name: string,
      },
      Amount: number,
    } >,
  } | null,
};
