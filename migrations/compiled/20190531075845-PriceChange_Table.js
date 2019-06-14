"use strict";
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable("PriceChange", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            PriceChangeDate: Sequelize.DATEONLY,
            createdAt: Sequelize.DATE,
            deletedAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
            Remark: {
                type: Sequelize.STRING(255),
                unique: true
            },
            createdBy: Sequelize.INTEGER,
            updatedBy: Sequelize.INTEGER
        }).then(function () {
            return queryInterface.createTable("PriceChangeDetail", {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                createdAt: Sequelize.DATE,
                deletedAt: Sequelize.DATE,
                updatedAt: Sequelize.DATE,
                PriceChangeId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        id: "id",
                        model: "PriceChange"
                    }
                },
                ProductId: Sequelize.INTEGER,
                PriceBookId: Sequelize.INTEGER,
                OldPrice: Sequelize.DECIMAL(14, 2),
                NewPrice: Sequelize.DECIMAL(14, 2),
                Approved: Sequelize.BOOLEAN
            });
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable("PriceChangeDetail").then(function () {
            return queryInterface.dropTable("PriceChange");
        });
    }
};
