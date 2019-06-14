import { Sequelize } from "sequelize-typescript";
import * as fs from "fs";

const configs = JSON.parse(fs.readFileSync(__dirname + "/../../config/db.config.json", "utf8"));
const env = process.env.NODE_ENV || "development";
const config = configs[env];
console.log(`Model path is ${__dirname}`);
const sequelize: Sequelize =  new Sequelize({
    ...config,
    modelPaths: [
        __dirname + "/models"
    ]
});

export default sequelize;