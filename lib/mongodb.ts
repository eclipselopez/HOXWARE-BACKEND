import mongoose from "mongoose";
import config from "config";
import logger from "./logger";

export default class MongoConn {
  mongoConn: mongoose.Connection;
  private static _instance: MongoConn;

  constructor() {
    this.connectDB();
    this.mongoConn = mongoose.connection;
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  public get getConnection() {
    return this.mongoConn;
  }

  public async connectDB() {
    mongoose.set('strictQuery', false)
    mongoose.connect(
      `${config.get("mongodb.url")}/${config.get("mongodb.database")}`,
      config.get("mongodb.options"),
      (err) => {
        if (err) {
          logger.error(err);
          return;
        }
        logger.info(config.get("mongodb.url"));
        logger.info(
          `Connected to the database ${config.get("mongodb.database")}`
        );
      }
    );
  }

  public async disconnect() {
    mongoose.disconnect();
  }
}
