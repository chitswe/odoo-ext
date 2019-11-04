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
    operation_type:  {
      __typename: "OperationType",
      id: string,
      use_create_lots: boolean,
      use_existing_lots: boolean
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
      operation_type:  {
        __typename: "OperationType",
        id: string,
        use_create_lots: boolean,
        use_existing_lots: boolean
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

export interface createStockMoveLineMutationVariables {
  move_id: number,
  lot_name: string,
};

export interface createStockMoveLineMutation {
  createStockMoveLine:  {
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

export interface deleteStockMoveLineMutationVariables {
  id: number,
};

export interface deleteStockMoveLineMutation {
  createStockMoveLine:  {
    __typename: "StockMoveLine",
    id: number
  } | null,
};