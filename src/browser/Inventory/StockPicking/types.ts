/* tslint:disable */
//  This file was automatically generated and should not be edited.

export enum ProductTracking {
  lot = "lot",
  none = "none",
  serial = "serial",
}


export enum PickingState {
  assigned = "assigned",
  cancel = "cancel",
  confirmed = "confirmed",
  done = "done",
  draft = "draft",
  waiting = "waiting",
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
          __typename: "ProductLot",
          id: number,
          name: string,
          product_qty: number | null,
          created: boolean | null,
        } | null,
        quant:  {
          __typename: "ProductQuant",
          quantity: number,
        } | null,
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
