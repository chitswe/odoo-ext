import gql from "graphql-tag";
import { schema as picking_schema } from "./Picking/StockPicking";
import { schema as product_schema } from "./MasterData/Product";
import { schema as stock_move_schema } from "./Picking/StockMove";
import { schema as master_name_schema } from "./MasterData/MasterName";
import { schema as stock_move_line_schema } from "./Picking/StockMoveLine";
import { schema as product_pricelist_schema } from "./PriceList";
import { schema as purchase_order_line_schema } from "./PurchaseOrder/OrderLine";
import { schema as operation_type_schema } from "./MasterData/OperationType";
import { schema as product_lot_schema } from "./ProductLot/index";
import { schema as product_quant_schema } from "./ProductQuant/index";
import { schema as sales_order_schema } from "./SalesOrder/index";
const schema = gql`
  scalar DateTime
  scalar Date
  scalar AnyString
  type PageInfo {
    hasMore: Boolean!
    page: Int!
    pageSize: Int!
  }
  interface WithPagination {
    pageInfo: PageInfo!
  }

  type AggregateResult {
    count: Int
  }

  interface WithAggregateResult {
    aggregate: AggregateResult!
  }

  type Customer {
    id: Int
    name: String
  }
  type Query {
    hello: String!
    pickings(
      page: Int = 1
      pageSize: Int = 20
      order: String
      filter: [[[String!]!]!]
    ): StockPickingConnection
    picking(id: Int!): StockPicking
    stock_move(id: Int!): StockMove
    pricelists(
      page: Int = 1
      pageSize: Int = 20
      order: String
      filter: [[[String!]!]!]
    ): ProductPriceListConnection
    getprice(priceListId: Int, productId: Int, partnerId: Int): String!
    product(id: Int!): Product
    products(
      page: Int = 1
      pageSize: Int = 20
      order: String
      filter: [[[AnyString!]!]!]
    ): ProductConnection

    purchase_order_lines(
      page: Int = 1
      pageSize: Int = 20
      order: String
      filter: [[[AnyString!]!]!]
    ): PurchaseOrderLineConnection   

    sales_order(
      page: Int = 1
      pageSize: Int = 20
      order: String
      filter: [[[AnyString!]!]!]
    ): SalesOrderConnection   
  }

  type Mutation {
    changePrice(productId: Int!, priceListId: Int!, price: Float!): ProductPrice
    generateProductLot(pickingId: Int!, moveId: Int!):StockMoveLineConnection
    changeProductLot(id:Int!,pickingId:Int!,lotname:String!):StockMoveLine
    createStockMoveLine(move_id:Int!, lot_name: String!):StockMoveLine
  }

  ${picking_schema}
  ${product_schema}
  ${stock_move_schema}
  ${master_name_schema}
  ${stock_move_line_schema}
  ${product_pricelist_schema}
  ${purchase_order_line_schema}
  ${operation_type_schema}
  ${product_lot_schema}
  ${product_quant_schema}
  ${sales_order_schema}
`;

export default schema;
