import { property } from "lodash";
import Odoo from "../odoo";
import { masterNameResolve, MasterType } from "../MasterData/MasterName";
import { AuthResult } from "../auth";
import sequelize from "../sequelize";
import PriceChange from "../models/PriceChange";
import PriceChangeDetail from "../models/PriceChangeDetail";
import { HasManyAddAssociationMixinOptions } from "sequelize";
import { productFind } from "../MasterData/Product";

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
        ProductId:Int!
        PriceBookId:Int!
        OldPrice:Float!
        NewPrice:Float!
        Approved:Boolean!
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

const mutation = {
    createPriceChange: async (parent: any, params: any, context: AuthResult) => {
        const { PriceChangeDate, Remark, createdBy, detail } = params;
        return sequelize.transaction(t => {
            return PriceChange.create({ PriceChangeDate, Remark, createdBy }, { fields: ["PriceChangeDate", "Remark", "createdBy"], transaction: t}).then((result: PriceChange) => {
                let promises = detail.map((d: PriceChangeDetail) => {
                    return PriceChangeDetail.create({ ...d, PriceChangeId: result.id }, {transaction: t});
                });

                return Promise.all(promises).then((resultDetail) => {
                    return result;
                });
            });
        });

    }
};

export { schema, resolver, mutation };