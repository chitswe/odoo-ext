import { QueryInterface, SequelizeStatic } from 'sequelize';

export = {
  up: (queryInterface: QueryInterface, Sequelize: SequelizeStatic) => {
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
    }).then(() => {
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

  down: (queryInterface: QueryInterface, Sequelize: SequelizeStatic) => {
    queryInterface.dropTable("PriceChangeDetail");
    queryInterface.dropTable("PriceChange");
    // return queryInterface.dropTable("PriceChangeDetail").then(() => {
    //   return queryInterface.dropTable("PriceChange");
    // });
  }
};
