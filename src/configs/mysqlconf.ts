import { Connection, createConnection, escape } from 'mysql';
import * as ora from 'ora';

/**
 * Database class to handle database queries
 *
 * @class Database
 */
export class Database {
    /**
     * Database connection object
     *
     * @private
     * @type {Pool}
     * @memberof Database
     */
    private conn: Connection;

    constructor(conf: string) {
        this.conn = createConnection(conf);
        const spinner = ora('Establishing MySQL connection ').start();
        this.conn.connect((err) => {
            if (err) {
                spinner.fail(`Connection error ,${err.message}`);
                process.exit();
            }
            spinner.succeed('MySQL connection established. Press any key to continue. \n').stop();
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
    public query(sql: string, params?: Array<string | number> | any): Promise<object[]> {
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
    public escape(param: string): string {
        return escape(param);
    }
}
