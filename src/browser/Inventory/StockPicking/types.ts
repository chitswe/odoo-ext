/* tslint:disable */
//  This file was automatically generated and should not be edited.

export enum ProductTracking {
  serial = "serial",
  lot = "lot",
  none = "none",
}


export enum PickingState {
  draft = "draft",
  waiting = "waiting",
  confirmed = "confirmed",
  assigned = "assigned",
  done = "done",
  cancel = "cancel",
}


export interface StockMoveLineFindByStockMoveIdQueryVariables {
  id: number,
  page?: number | null,
  pageSize?: number | null,
  order?: string | null,
};

export interface StockMoveLineFindByStockMoveIdQuery {
  stock_move:  {
    __typename: "StockMove",
    id: number,
    product:  {
      __typename: "Product",
      id: number,
      default_code: string,
    },
    move_lines:  {
      __typename: "StockMoveLineConnection",
      aggregate:  {
        __typename: "AggregateResult",
        count: number | null,
      },
      edges:  Array< {
        __typename: "StockMoveLine",
        id: number,
        lot_name:  {
          __typename: "MasterName",
          id: string,
          name: string,
        },
      } >,
      pageInfo:  {
        __typename: "PageInfo",
        hasMore: boolean,
        page: number,
        pageSize: number,
      },
    } | null,
  } | null,
};

export interface StockMoveFindByPickingIdQueryVariables {
  id: number,
  page?: number | null,
  pageSize?: number | null,
  order?: string | null,
};

export interface StockMoveFindByPickingIdQuery {
  picking:  {
    __typename: "StockPicking",
    id: number,
    stock_moves:  {
      __typename: "StockMoveConnection",
      aggregate:  {
        __typename: "AggregateResult",
        count: number | null,
      },
      edges:  Array< {
        __typename: "StockMove",
        id: number,
        product:  {
          __typename: "Product",
          id: number,
          name: string,
          default_code: string,
          tracking: ProductTracking,
        },
        quantity_done: number | null,
        product_uom_qty: number | null,
        product_uom:  {
          __typename: "MasterName",
          id: string,
          name: string,
        },
      } >,
      pageInfo:  {
        __typename: "PageInfo",
        hasMore: boolean,
        page: number,
        pageSize: number,
      },
    } | null,
  } | null,
};

export interface StockPickingFindQueryVariables {
  id: number,
};

export interface StockPickingFindQuery {
  picking:  {
    __typename: "StockPicking",
    id: number,
    name: string,
    location_dest:  {
      __typename: "MasterName",
      id: string,
      name: string,
    },
    location:  {
      __typename: "MasterName",
      id: string,
      name: string,
    },
    partner:  {
      __typename: "MasterName",
      id: string,
      name: string,
    } | null,
    scheduled_date: string,
    state: PickingState,
    picking_type:  {
      __typename: "MasterName",
      id: string,
      name: string,
    },
  } | null,
};

export interface StockPickingFindAllQueryVariables {
  page?: number | null,
  pageSize?: number | null,
  order?: string | null,
  filter?: Array< Array< Array< string > > > | null,
};

export interface StockPickingFindAllQuery {
  pickings:  {
    __typename: "StockPickingConnection",
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
      __typename: "StockPicking",
      id: number,
      name: string,
      location_dest:  {
        __typename: "MasterName",
        id: string,
        name: string,
      },
      location:  {
        __typename: "MasterName",
        id: string,
        name: string,
      },
      partner:  {
        __typename: "MasterName",
        id: string,
        name: string,
      } | null,
      scheduled_date: string,
      state: PickingState,
      picking_type:  {
        __typename: "MasterName",
        id: string,
        name: string,
      },
    } >,
  } | null,
};
