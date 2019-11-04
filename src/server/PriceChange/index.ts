import { property } from "lodash";
import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { AuthResult } from "../auth";
import sequelize from "../sequelize";
import PriceChange from "../models/PriceChange";
import PriceChangeDetail from "../models/PriceChangeDetail";
import { HasManyAddAssociationMixinOptions } from "sequelize";
import { productFind } from "../MasterData/Product";
import { IFindOptions , Model } from "sequelize-typescript";
import { Op } from "sequelize";

const schema = `
    type PriceChange{
        id:Int!
        PriceChangeDate:Date!
        Remark:String
        createdAt:DateTime!
        updatedAt:DateTime!
        createdBy:MasterName!
        detail:[PriceChangeDetail]
    }

    type PriceChangeDetail{
        id:Int!
        product:Product!
        PriceChange: PriceChange
        PriceBook:ProductPriceList!
        OldPrice:Float!
        NewPrice:Float!
        Approved:Boolean!
    }

    type PriceChangeConnection implements WithPagination & WithAggregateResult{
        pageInfo:PageInfo!
        edges:[PriceChange!]!
        aggregate:AggregateResult!
      }
    
    input InputPriceChangeDetail{
        id:Int!
        ProductId:Int!
        PriceBookId:Int!
        OldPrice:Float!
        NewPrice:Float!
        Approved:Boolean!
    }

    type PriceChangeDetailConnection implements WithPagination & WithAggregateResult{
        pageInfo:PageInfo!
        edges:[PriceChangeDetail!]!
        aggregate:AggregateResult!
      }
`;

const resolver = {
    PriceChange: {
        id: property("id"),
        PriceChangeDate: property("PriceChangeDate"),
        Remark: property("Remark"),
        createdAt: property("createdAt"),
        updatedAt: property("updatedAt"),
        createdBy: (change: any, params: any, context: AuthResult) => {
            return context.odoo.execute_kwAsync("res.users", "search_read", params, {
                        offset: 0,
                        limit: 1,
                        fields: [
                            "id",
                            "name"
                        ]
                        })
                        .then(([p]: [any]) => {
                        return p;
                        });
        },        
         detail: (order: any) => {
             return order.detail;
         }
    },
    PriceChangeDetail: {
        id: property("id"),
        product: (change: any, params: any, context: AuthResult) => {
            return productFind(context.odoo, change.ProductId);
        },
        PriceChange: (change: any, parmas: any, context: AuthResult) => {
            return change.PriceChange ? change.PriceChange : PriceChange.findById(change.PriceChangeId);
        },
        PriceBook: (change: any, params: any, context: AuthResult) => {
            return context.odoo.execute_kwAsync("product.pricelist", "search_read", [[["id", "=", change.PriceBookId]]], {
                    offset: 0,
                    limit: 1,
                    fields: [
                        "id",
                        "name"
                        ]
                    })
                    .then(([p]: [any]) => {
                        return p;
                    });
        },
        OldPrice: property("OldPrice"),
        NewPrice: property("NewPrice"),
        Approved: property("Approved")
    }
};

const query = {
    price_change : async (
        parent: any,
        params: any,
        context: AuthResult
      ) => {
        const { pageSize = 1, page = 1, order, startDate, endDate } = params;
        const offset = (page - 1) * pageSize;

        const options: IFindOptions<PriceChange> = {
            include: [ { model: PriceChangeDetail }],
            where: startDate && endDate ? { $and: [ { PriceChangeDate: {$gte: startDate.assumeLocalAsUTC()}}, { PriceChangeDate: {$gte: startDate.assumeLocalAsUTC()}} ] } : {}
        };

        return PriceChange.findAndCountAll(options).then(({ rows, count }) => {     
          const pageInfo = { hasMore: page * pageSize < count, pageSize, page };   
          return {
            edges: rows,
            pageInfo,
            aggregate: {
              count
            }
          };
        });
      },
      get_price_change : async (
          parent: any,
          params: any,
          context: AuthResult
      ) => {
        const { priceChangeId } = params;

        return PriceChange.findById(priceChangeId, {include: [{model: PriceChangeDetail}]});

      },
      price_change_detail : async (
        parent: any,
        params: any,
        context: AuthResult
      ) => {
        const { pageSize = 1, page = 1, order, startDate, endDate } = params;
        const offset = (page - 1) * pageSize;

        const options: IFindOptions<PriceChangeDetail> = {
            where: { PriceChange: {PriceChangeDate: startDate} }
        };
  
        // return PriceChangeDetail.findAndCountAll({ include:  [ { model: PriceChange }]}).then(({ rows, count }) => {     
        //     const pageInfo = { hasMore: page * pageSize < count, pageSize, page };   
        //     return {
        //         edges: rows,
        //         pageInfo,
        //         aggregate: {
        //         count
        //         }
        //     };
        // });

        return sequelize.query(`SELECT D.* FROM "PriceChangeDetail" as D INNER JOIN "PriceChange" as P ON D."PriceChangeId"=P."id" WHERE P."PriceChangeDate" >= $startDate AND P."PriceChangeDate" <= $endDate limit ${pageSize} offset ${offset}`, {
            bind: {startDate: startDate.assumeLocalAsUTC(), endDate: endDate.assumeLocalAsUTC()}            
            }).then(priceChangeDetail => {
                return sequelize.query(`SELECT COUNT(*) AS "totalRows" FROM "PriceChangeDetail" as D INNER JOIN "PriceChange" as P ON D."PriceChangeId"=P."id" WHERE P."PriceChangeDate" >= $startDate AND P."PriceChangeDate" <= $endDate`, {
                    bind: {startDate: startDate.assumeLocalAsUTC(), endDate: endDate.assumeLocalAsUTC()},                   
                    type: sequelize.QueryTypes.SELECT
                }).then(result => {
                    const pageInfo = { hasMore: page * pageSize < 10, pageSize, page };   
                    return {
                        edges: priceChangeDetail[0],
                        pageInfo,
                        aggregate: {
                        count: result[0].totalRows
                        }
                    };
                });
            });
  
    }
};

const mutation = {
    createPriceChange: async (parent: any, params: any, context: AuthResult) => {
        const { PriceChangeDate, Remark, createdBy } = params;
        return sequelize.transaction(t => {
            return PriceChange.create({ PriceChangeDate, Remark, createdBy }, { fields: ["PriceChangeDate", "Remark", "createdBy"], transaction: t});
        });
    },
    updatePriceChange: async (parent: any, params: any, context: AuthResult) => {
        const { id, PriceChangeDate, Remark } = params;
        return sequelize.transaction(t => {
            return PriceChange.update({ PriceChangeDate, Remark }, { where: {id: id}, transaction: t}).then((result) => {
                return result;
                // let promises = detail.map((d: PriceChangeDetail) => {
                //     return PriceChangeDetail.update({ ...d, PriceChangeId: id }, { where: {id: d.id}, transaction: t});
                // });

                // return Promise.all(promises).then((resultDetail) => {
                //     return result;
                // });
            });
        });
    },
    createPriceChangeDetail: async (parent: any, params: any, context: AuthResult) => {
        const { PriceChangeId, ProductId, PriceBookId, OldPrice, NewPrice } = params;
        return sequelize.transaction(t => {
            return PriceChangeDetail.create({PriceChangeId, ProductId, PriceBookId, OldPrice, NewPrice, Approved: false}, { fields: ["PriceChangeId", "ProductId", "PriceBookId", "OldPrice", "NewPrice", "Approved"], transaction: t});
        });
    },
    updatePriceChangeDetail: async (parent: any, params: any, context: AuthResult) => {
        const { id, PriceChangeId, ProductId, PriceBookId, OldPrice, NewPrice } = params;
        return sequelize.transaction(t => {
            return PriceChangeDetail.findById(id, {transaction: t}).then(priceChange => {
                if ( priceChange )
                    return priceChange.update({ PriceChangeId, ProductId, PriceBookId, OldPrice, NewPrice}, { fields: ["PriceChangeId", "ProductId", "PriceBookId", "OldPrice", "NewPrice"], transaction: t});
                else
                    return { };
            });
        });
    }
};

export { schema, resolver, query, mutation };