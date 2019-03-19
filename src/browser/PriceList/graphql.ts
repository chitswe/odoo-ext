import gql from "graphql-tag";

const getMasterPriceListQuery = gql`
  query getPriceLists {
    pricelists {
      edges {
        id
        name
      }
    }
  }
`;

const productPriceListQuery = gql`
  query productForPriceList($productId: Int!, $priceListIds: [Int!]!) {
    product(id: $productId) {
      id
      name
      default_code
      priceLists(priceListIds: $priceListIds) {
        id
        price
        priceList {
          id
          name
        }
      }
    }
  }
`;

const purchaseOrderLinesQuery = gql`
  query purchaseOrderLines(
    $page: Int = 1
    $pageSize: Int = 20
    $order: String
    $filter: [[[AnyString!]!]!]
  ) {
    purchase_order_lines(
      page: $page
      pageSize: $pageSize
      order: $order
      filter: $filter
    ) {
      pageInfo {
        page
        pageSize
        hasMore
      }
      aggregate {
        count
      }
      edges {
        id
        product_uom {
          id
          name
        }
        product_name {
          id
          name
        }
        product_qty
        price_unit
        order_id {
          id
          name
        }
        date_planned
      }
    }
  }
`;

const productsPriceListQuery = gql`
  query productPriceList(
    $page: Int = 1
    $pageSize: Int = 10
    $order: String
    $filter: [[[AnyString!]!]!]
    $priceListIds: [Int!]!
  ) {
    products(page: $page, pageSize: $pageSize, order: $order, filter:$filter) {
      edges {
        id
        name
        default_code
        priceLists(priceListIds: $priceListIds) {
          id
          price
          priceList {
            id
            name
          }
        }
      }
      pageInfo {
        page
        pageSize
        hasMore
      }
      aggregate {
        count
      }
    }
  }
`;

const changePriceMutation = gql`
  mutation changePrice($productId: Int!, $priceListId: Int!, $price: Float!) {
    changePrice: changePrice(
      productId: $productId
      priceListId: $priceListId
      price: $price
    ) {
      id
      price
      priceList {
        id
        name
      }
      productId
    }
  }
`;

export {
  productsPriceListQuery,
  getMasterPriceListQuery,
  productPriceListQuery,
  changePriceMutation,
  purchaseOrderLinesQuery
};
