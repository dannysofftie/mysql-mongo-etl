"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
function mysqlConfig(options) {
    try {
        return `mysql://${options.mysqlusername.trim()}:${options.mysqlpassword.trim()}@${options.mysqlhost.trim()}:3306/${options.mysqldatabase.trim()}?connectionLimit=10&dateStrings=true`;
    }
    catch (e) {
        return process.exit();
    }
}
exports.mysqlConfig = mysqlConfig;
function mongoConfig(options) {
    try {
        return new RegExp(/^(?:(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(\.(?!$)|$)){4}$/).test(options.mongohost)
            ? `mongodb://${options.mongousername.trim()}:${options.mongopassword.trim()}@${options.mongohost.trim()}/${options.mongodatabase.trim()}?retryWrites=true`
            : `mongodb+srv://${options.mongousername.trim()}:${options.mongopassword.trim()}@${options.mongohost.trim()}/${options.mongodatabase.trim()}?retryWrites=true`;
    }
    catch (e) {
        return process.exit();
    }
}
exports.mongoConfig = mongoConfig;
__export(require("./mysqlconf"));
