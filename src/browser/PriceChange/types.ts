/* tslint:disable */
//  This file was automatically generated and should not be edited.

export interface PriceChangeQueryVariables {
  page?: number | null,
  pageSize?: number | null,
  order?: string | null,
  startDate: string,
  endDate: string,
};

export interface PriceChangeQuery {
  price_change:  {
    __typename: "PriceChangeConnection",
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
      __typename: "PriceChange",
      id: number,
      PriceChangeDate: string,
      Remark: string | null,
      createdAt: string,
      updatedAt: string,
      createdBy:  {
        __typename: "MasterName",
        name: string,
      },
      detail:  Array< {
        __typename: "PriceChangeDetail",
        id: number,
        product:  {
          __typename: "Product",
          id: number,
          name: string,
        },
        PriceBook:  {
          __typename: "ProductPriceList",
          id: number,
          name: string,
        },
        OldPrice: number,
        NewPrice: number,
        Approved: boolean,
      } | null > | null,
    } >,
  } | null,
};

export interface PriceChangeDetailQueryVariables {
  startDate: string,
  endDate: string,
  page?: number | null,
  pageSize: number,
};

export interface PriceChangeDetailQuery {
  price_change_detail:  {
    __typename: "PriceChangeDetailConnection",
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
      __typename: "PriceChangeDetail",
      id: number,
      product:  {
        __typename: "Product",
        name: string,
      },
      PriceBook:  {
        __typename: "ProductPriceList",
        name: string,
      },
      OldPrice: number,
      NewPrice: number,
    } >,
  } | null,
};

export interface GetPriceChangeQueryVariables {
  priceChangeId: number,
};

export interface GetPriceChangeQuery {
  get_price_change:  {
    __typename: "PriceChange",
    id: number,
    PriceChangeDate: string,
    Remark: string | null,
    createdAt: string,
    updatedAt: string,
    createdBy:  {
      __typename: "MasterName",
      name: string,
    },
    detail:  Array< {
      __typename: "PriceChangeDetail",
      id: number,
      product:  {
        __typename: "Product",
        id: number,
        name: string,
      },
      PriceBook:  {
        __typename: "ProductPriceList",
        id: number,
        name: string,
      },
      OldPrice: number,
      NewPrice: number,
      Approved: boolean,
    } | null > | null,
  } | null,
};

export interface createPriceChangeMutationVariables {
  PriceChangeDate: string,
  Remark?: string | null,
  createdBy: number,
};

export interface createPriceChangeMutation {
  createPriceChange:  {
    __typename: "PriceChange",
    id: number,
    PriceChangeDate: string,
    Remark: string | null,
    createdAt: string,
    updatedAt: string,
    createdBy:  {
      __typename: "MasterName",
      name: string,
    },
    detail:  Array< {
      __typename: "PriceChangeDetail",
      id: number,
      product:  {
        __typename: "Product",
        id: number,
        name: string,
      },
      PriceBook:  {
        __typename: "ProductPriceList",
        id: number,
        name: string,
      },
      OldPrice: number,
      NewPrice: number,
      Approved: boolean,
    } | null > | null,
  } | null,
};

export interface updatePriceChangeMutationVariables {
  id: number,
  PriceChangeDate: string,
  Remark?: string | null,
};

export interface updatePriceChangeMutation {
  updatePriceChange:  {
    __typename: "PriceChange",
    id: number,
    PriceChangeDate: string,
    Remark: string | null,
    createdAt: string,
    updatedAt: string,
    createdBy:  {
      __typename: "MasterName",
      name: string,
    },
    detail:  Array< {
      __typename: "PriceChangeDetail",
      id: number,
      product:  {
        __typename: "Product",
        id: number,
        name: string,
      },
      PriceBook:  {
        __typename: "ProductPriceList",
        id: number,
        name: string,
      },
      OldPrice: number,
      NewPrice: number,
      Approved: boolean,
    } | null > | null,
  } | null,
};

export interface createPriceChangeDetailMutationVariables {
  PriceChangeId: number,
  ProductId: number,
  PriceBookId: number,
  OldPrice: number,
  NewPrice: number,
};

export interface createPriceChangeDetailMutation {
  createPriceChangeDetail:  {
    __typename: "PriceChangeDetail",
    id: number,
    product:  {
      __typename: "Product",
      id: number,
      name: string,
    },
    PriceBook:  {
      __typename: "ProductPriceList",
      id: number,
      name: string,
    },
    OldPrice: number,
    NewPrice: number,
    Approved: boolean,
  } | null,
};

export interface updatePriceChangeDetailMutationVariables {
  id: number,
  PriceChangeId: number,
  ProductId: number,
  PriceBookId: number,
  OldPrice: number,
  NewPrice: number,
};

export interface updatePriceChangeDetailMutation {
  updatePriceChangeDetail:  {
    __typename: "PriceChangeDetail",
    id: number,
    product:  {
      __typename: "Product",
      id: number,
      name: string,
    },
    PriceBook:  {
      __typename: "ProductPriceList",
      id: number,
      name: string,
    },
    OldPrice: number,
    NewPrice: number,
    Approved: boolean,
  } | null,
};

export interface productListQueryVariables {
  page?: number | null,
  pageSize?: number | null,
  order?: string | null,
  filter?: Array< Array< Array< string > > > | null,
};

export interface productListQuery {
  products:  {
    __typename: "ProductConnection",
    edges:  Array< {
      __typename: "Product",
      id: number,
      name: string,
      default_code: string,
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
