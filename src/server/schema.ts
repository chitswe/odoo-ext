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
import { schema as price_change_schema } from "./PriceChange/index";
import { schema as payment_schema } from "./Payment/index";
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

    get_sales_order(id:Int!):SalesOrder

    price_change(
      page: Int = 1
      pageSize: Int = 20
      order: String
      startDate: Date
      endDate: Date
    ): PriceChangeConnection

    get_price_change(
      priceChangeId: Int!
    ): PriceChange

    price_change_detail(
      startDate: Date!     
      endDate: Date!
      page:Int
      pageSize:Int! 
    ): PriceChangeDetailConnection

    payment(
      page: Int = 1
      pageSize: Int = 20
      order: String
      filter: [[[AnyString!]!]!]
    ): PaymentConnection

    payments_by_orderId(
      page: Int = 1
      pageSize: Int = 20
      order: String
      filter: [[[AnyString!]!]!]
    ): PaymentConnection

  }

  type Mutation {
    changePrice(productId: Int!, priceListId: Int!, price: Float!): ProductPrice
    generateProductLot(pickingId: Int!, moveId: Int!):StockMoveLineConnection
    changeProductLot(id:Int!,pickingId:Int!,lotname:String!):StockMoveLine
    createStockMoveLine(move_id:Int!, lot_name: String!):StockMoveLine
    createPriceChange(PriceChangeDate:Date!,Remark:String,createdBy:Int!):PriceChange
    updatePriceChange(id:Int!,PriceChangeDate:Date!,Remark:String):PriceChange
    createPriceChangeDetail(PriceChangeId:Int!,ProductId:Int!,PriceBookId:Int!,OldPrice:Float!,NewPrice:Float!):PriceChangeDetail
    updatePriceChangeDetail(id:Int!,PriceChangeId:Int!,ProductId:Int!,PriceBookId:Int!,OldPrice:Float!,NewPrice:Float!):PriceChangeDetail
    deleteStockMoveLine(id:Int!):StockMoveLine
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
  ${price_change_schema}
  ${payment_schema}
`;

export default schema;
