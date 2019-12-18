import gql from "graphql-tag";

const stockMoveLineFindByStockMoveId = gql`
  
query StockMoveLineFindByStockMoveId($pickingId:Int!, $stockMoveId: Int!, $page:Int=1, $pageSize:Int=20,$order:String){
  picking(id:$pickingId){
    id
    name  
    scheduled_date   
    state 
    operation_type {
      id
      use_create_lots
      use_existing_lots
    }
    stock_move(id:$stockMoveId){
      id
      product{
        id
        default_code
        name
        tracking
      }
      quantity_done
      product_uom_qty
      move_lines(page:$page,pageSize:$pageSize, order:$order){
        aggregate {
          count
        }
        edges {
          id
          lot_name
          product_lot{
            id
            name
            product_qty
            created
          }
          quant{
            quantity
          }
        }
        pageInfo {
          hasMore
          page
          pageSize
        }
      }
    }
  }
}
`;  

const stockMoveFindByPickingId = gql`
  query StockMoveFindByPickingId(
    $id: Int!
    $page: Int = 1
    $pageSize: Int = 20
    $order: String
  ) {
    picking(id: $id) {
      id
      name
      scheduled_date
      stock_moves(page: $page, pageSize: $pageSize, order: $order) {
        aggregate {
          count
        }
        edges {
          id
          product {
            id
            name
            default_code
            tracking
          }
          quantity_done
          product_uom_qty
          product_uom {
            id
            name
          }
        }
        pageInfo {
          hasMore
          page
          pageSize
        }
      }
    }
  }
`;

const stockPickingFindQuery = gql`
  query StockPickingFind($id: Int!) {
    picking(id: $id) {
      id
      name
      location_dest {
        id
        name
      }
      location {
        id
        name
      }
      partner {
        id
        name
      }
      operation_type {
        id
        use_create_lots
        use_existing_lots
      }
      scheduled_date
      state
      picking_type {
        id
        name
      }
    }
  }
`;
const stockPickingFindAllQuery = gql`
  query StockPickingFindAll($page: Int, $pageSize: Int, $order: String,
    $filter:[[[String!]!]!]) {
    pickings(page: $page, pageSize: $pageSize, order: $order, filter:$filter) {
      pageInfo {
        hasMore 
        page
        pageSize
      }
      aggregate {
        count
      }
      edges {
        id
        name
        location_dest {
          id
          name
        }
        location {
          id
          name
        }
        partner {
          id
          name
        }
        operation_type {
          id
          use_create_lots
          use_existing_lots
        }
        scheduled_date
        state
        picking_type {
          id
          name
        }
      }
    }
  }
`;

const generateProductLotMutation = gql`
mutation generateProductLot($pickingId:Int!, $moveId:Int!, $generateQty:Int!){
  generateProductLot(pickingId:$pickingId, moveId:$moveId, generateQty: $generateQty) {
        aggregate {
          count
        }
        edges {
          id
          lot_name
          product_lot{
            id
            name
            product_qty
            created
          }
          quant{
            quantity
          }
        }
        pageInfo {
          hasMore
          page
          pageSize
        }
      }
  }
`;

const changeProductLotMutation = gql`
mutation changeProductLot($id:Int!,$pickingId:Int!,$lotname:String!){
  changeProductLot(id:$id,pickingId:$pickingId,lotname:$lotname){
    id
    lot_name
    product_lot{
      id
      name
      product_qty
      created
    }
    quant{
      quantity
    }
  }
}
`;

const createStockMoveLineMutation = gql`
mutation createStockMoveLine($move_id:Int!, $lot_name: String!){
  createStockMoveLine(move_id:$move_id, lot_name: $lot_name){
    id
    lot_name
    product_lot{
      id
      name
      product_qty
      created
    }
    quant{
      quantity
    }
  }
}
`;

const deleteStockMoveLineMutation = gql`
mutation deleteStockMoveLine($id:Int!){
  deleteStockMoveLine(id:$id){
    id
  }
}
`;

export {
  stockPickingFindAllQuery,
  stockPickingFindQuery,
  stockMoveFindByPickingId,
  stockMoveLineFindByStockMoveId,
  generateProductLotMutation,
  changeProductLotMutation,
  createStockMoveLineMutation,
  deleteStockMoveLineMutation
};
