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
  pickingId: number,
  stockMoveId: number,
  page?: number | null,
  pageSize?: number | null,
  order?: string | null,
};

export interface StockMoveLineFindByStockMoveIdQuery {
  picking:  {
    __typename: "StockPicking",
    id: number,
    name: string,
    scheduled_date: string,
    stock_move:  {
      __typename: "StockMove",
      id: number,
      product:  {
        __typename: "Product",
        id: number,
        default_code: string,
        name: string,
        tracking: ProductTracking,
      },
      quantity_done: number | null,
      product_uom_qty: number | null,
      move_lines:  {
        __typename: "StockMoveLineConnection",
        aggregate:  {
          __typename: "AggregateResult",
          count: number | null,
        },
        edges:  Array< {
          __typename: "StockMoveLine",
          id: number,
          lot_name: string | null,
          product_lot:  {
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
    name: string,
    scheduled_date: string,
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

export interface generateProductLotMutationVariables {
  pickingId: number,
  moveId: number,
};

export interface generateProductLotMutation {
  generateProductLot:  {
    __typename: "StockMoveLineConnection",
    aggregate:  {
      __typename: "AggregateResult",
      count: number | null,
    },
    edges:  Array< {
      __typename: "StockMoveLine",
      id: number,
      lot_name: string | null,
      product_lot:  {
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
};

export interface changeProductLotMutationVariables {
  id: number,
  pickingId: number,
  lotname: string,
};

export interface changeProductLotMutation {
  changeProductLot:  {
    __typename: "StockMoveLine",
    id: number,
    lot_name: string | null,
    product_lot:  {
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
  } | null,
};
