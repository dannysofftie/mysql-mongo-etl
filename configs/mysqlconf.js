"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("mysql");
const ora = require("ora");
/**
 * Database class to handle database queries
 *
 * @class Database
 */
class Database {
    constructor(conf) {
        this.conn = mysql_1.createConnection(conf);
        const spinner = ora('Establishing MySQL connection ').start();
        this.conn.connect((err) => {
            if (err) {
                spinner.fail(`Connection error ,${err.message}`);
                process.exit();
            }
            spinner.succeed('MySQL connection established. Press tab key to continue. \n').stop();
        });
    }
    /**
     * Execute passed sql into database
     *
     * @param {string} sql - sql query to execute
     * @param {(Array<string | number> | any)} [params] - data to insert if any
     * @returns {Promise<string[]>}
     * @memberof Database
     */
    query(sql, params) {
        return new Promise((resolve, reject) => {
            typeof params === 'undefined'
                ? this.conn.query(sql, (err, results) => (err ? reject(err) : resolve(results)))
                : this.conn.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
        });
    }
    /**
     * Escape passed value
     *
     * @param {string} param
     * @returns {string}
     * @memberof Database
     */
    escape(param) {
        return mysql_1.escape(param);
    }
}
exports.Database = Database;
