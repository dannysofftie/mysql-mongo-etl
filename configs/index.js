"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
function mysqlConfig(options) {
    return `mysql://${options.mysqlusername.trim()}:${options.mysqlpassword.trim()}@${options.mysqlhost.trim()}:3306/${options.mysqldatabase.trim()}?connectionLimit=10&dateStrings=true`;
}
exports.mysqlConfig = mysqlConfig;
function mongoConfig(options) {
    return `mongodb://${options.mongousername.trim()}:${options.mongopassword.trim()}@${options.mongohost.trim()}:27017/${options.mongodatabase.trim()}`;
}
exports.mongoConfig = mongoConfig;
__export(require("./mysqlconf"));
