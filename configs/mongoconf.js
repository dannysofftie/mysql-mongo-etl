"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const ora = require("ora");
const mongodb_1 = require("mongodb");
class MongoConnection {
    constructor(options) {
        this.options = options;
    }
    connect() {
        const spinner = ora('Establishing MongoDB connection').start();
        return new Promise((resolve) => {
            mongodb_1.MongoClient.connect(_1.mongoConfig(this.options), { useNewUrlParser: true }, (err, client) => {
                if (err) {
                    spinner.fail(`MongoDB connection error ${err.message}`).stop();
                    process.exit();
                }
                spinner.succeed('MongoDB connection established. Press any key to continue. \n').stop();
                this.connection = client;
                this.database = this.connection.db(this.options.mongodatabase);
                resolve(client);
            });
        });
    }
}
exports.MongoConnection = MongoConnection;
