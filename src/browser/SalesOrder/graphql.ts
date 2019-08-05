import gql from "graphql-tag";

const salesOrderListQuery = gql`
query SalesOrder($page: Int, $pageSize: Int, $order: String,  
    $filter:[[[AnyString!]!]!]) {
    sales_order(page: $page, pageSize: $pageSize, order: $order, filter:$filter) {
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
        date_order
        Customer{
          id
          name
        }
        SalesPerson{
          id
          name
        }
        amount_total
        InvoiceTotal
      }
    }
  }
`;

export { salesOrderListQuery };