import gql from "graphql-tag";

const priceChangeListQuery = gql`
query PriceChange($page: Int, $pageSize: Int, $order: String,  
  $startDate:Date!,$endDate:Date!) {
    price_change(page: $page, pageSize: $pageSize, order: $order, startDate:$startDate,endDate:$endDate) {
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
        PriceChangeDate
        Remark
        createdAt
        updatedAt     
        createdBy{
          name
        }        
        detail{
          id
          product{
            id
            name
          }
          PriceBook{
            id
            name
          }
          OldPrice
          NewPrice
          Approved
        }
      }
    }
  }
`;

const priceChangeDetailListQuery =  gql`
query PriceChangeDetail($startDate:Date!,$endDate:Date!,$page:Int,$pageSize:Int!){
  price_change_detail(startDate:$startDate,endDate:$endDate,page:$page,pageSize:$pageSize ){
    pageInfo {
        hasMore
        page
        pageSize
      }
      aggregate {
        count
      }
    edges{
      id
      product{
        name
      }
      PriceBook{
        name
      }
      OldPrice
      NewPrice      
    }
  }
}
`;

const getPriceChangeQuery = gql`
query GetPriceChange($priceChangeId:Int!){
  get_price_change(priceChangeId:$priceChangeId){
      id
      PriceChangeDate
      Remark
      createdAt
      updatedAt     
      createdBy{
        name
      }        
      detail{
        id
        product{
          id
          name
        }
        PriceBook{
          id
          name
        }
        OldPrice
        NewPrice
        Approved
      }
  }
}
`;

const createPriceChangeMutation = gql`
  mutation createPriceChange($PriceChangeDate:Date!,$Remark:String,$createdBy:Int!){
    createPriceChange(PriceChangeDate:$PriceChangeDate,Remark:$Remark,createdBy:$createdBy){
      id
      PriceChangeDate
      Remark
      createdAt
      updatedAt     
      createdBy{
        name
      }        
      detail{
        id
        product{
          id
          name
        }
        PriceBook{
          id
          name
        }
        OldPrice
        NewPrice
        Approved
      }
    }
  }
`;

const updatePriceChangeMutation = gql`
  mutation updatePriceChange($id:Int!,$PriceChangeDate:Date!,$Remark:String){
    updatePriceChange(id:$id,PriceChangeDate:$PriceChangeDate,Remark:$Remark){
      id
      PriceChangeDate
      Remark
      createdAt
      updatedAt     
      createdBy{
        name
      }        
      detail{
        id
        product{
          id
          name
        }
        PriceBook{
          id
          name
        }
        OldPrice
        NewPrice
        Approved
      }
    }
  }
`;

const createPriceChangeDetailMutation = gql`
  mutation createPriceChangeDetail($PriceChangeId:Int!,$ProductId:Int!,$PriceBookId:Int!,$OldPrice:Float!,$NewPrice:Float!){
    createPriceChangeDetail(PriceChangeId:$PriceChangeId,ProductId:$ProductId,PriceBookId:$PriceBookId,OldPrice:$OldPrice,NewPrice:$NewPrice){
        id
        product{
          id
          name
        }
        PriceBook{
          id
          name
        }
        OldPrice
        NewPrice
        Approved
    }
  }
`;

const updatePriceChangeDetailMutation = gql`
  mutation updatePriceChangeDetail($id:Int!,$PriceChangeId:Int!,$ProductId:Int!,$PriceBookId:Int!,$OldPrice:Float!,$NewPrice:Float!){
    updatePriceChangeDetail(id:$id,PriceChangeId:$PriceChangeId,ProductId:$ProductId,PriceBookId:$PriceBookId,OldPrice:$OldPrice,NewPrice:$NewPrice){
        id
        product{
          id
          name
        }
        PriceBook{
          id
          name
        }
        OldPrice
        NewPrice
        Approved
    }
  }
`;

const productListQuery = gql`
  query productList(
    $page: Int = 1
    $pageSize: Int = 10
    $order: String
    $filter: [[[AnyString!]!]!]
  ) {
    products(page: $page, pageSize: $pageSize, order: $order, filter:$filter) {
      edges {
        id
        name
        default_code
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

export { productListQuery, priceChangeListQuery, priceChangeDetailListQuery, getPriceChangeQuery, createPriceChangeMutation, updatePriceChangeMutation, createPriceChangeDetailMutation, updatePriceChangeDetailMutation };