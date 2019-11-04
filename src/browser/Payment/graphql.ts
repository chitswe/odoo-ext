import gql from "graphql-tag";

const paymentListQuery = gql`
query Payment($page: Int, $pageSize: Int, $order: String,  
    $filter:[[[AnyString!]!]!]) {
    payment(page: $page, pageSize: $pageSize, order: $order, filter:$filter) {
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
        PaymentDate
        PaymentNumber
        PaymentType
        partner{
            id
            name
        }
        journal{
          id
          name
        }
        createdBy{
          id
          name
        }
        Amount
      }
    }
  }
`;

const paymentByOrderIdQuery = gql`
  query PaymentByOrderId($page: Int = 1
    $pageSize: Int = 10
    $order: String
    $filter: [[[AnyString!]!]!]) {
    payments_by_orderId(page: $page, pageSize: $pageSize, order: $order, filter:$filter) {
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
        PaymentDate
        PaymentNumber
        PaymentType
        partner{
            id
            name
        }
        journal{
          id
          name
        }
        createdBy{
          id
          name
        }
        Amount
      }
    }
  }
`;

export { paymentListQuery, paymentByOrderIdQuery };