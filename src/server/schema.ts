import gql from "graphql-tag";
import { schema as picking_schema } from "./Picking/StockPicking";
import { schema as product_schema } from "./MasterData/Product";
import { schema as stock_move_schema } from "./Picking/StockMove";
import { schema as master_name_schema } from "./MasterData/MasterName";
import { schema as stock_move_line_schema } from "./Picking/StockMoveLine";
const schema = gql`
  scalar DateTime
  scalar Date
  type PageInfo{
    hasMore:Boolean!
    page:Int!
    pageSize:Int!
  }
  interface WithPagination{
    pageInfo:PageInfo!
  }

  type AggregateResult{
    count:Int
  }

  interface WithAggregateResult{
    aggregate:AggregateResult!
  }

  type Customer {
    id: Int
    name: String
  }
  type Query {
    hello: String!
    pickings(page:Int = 1, pageSize: Int = 20, order:String,filter:[[[String!]!]!]): StockPickingConnection
    picking(id:Int!): StockPicking
    stock_move(id:Int!): StockMove
  }
  ${picking_schema}
  ${product_schema}
  ${stock_move_schema}
  ${master_name_schema}
  ${stock_move_line_schema}
`;

export default schema;
