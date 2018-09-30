import { createPool, escape, Pool } from 'mysql';

import { mysqlConfig } from './config';

/**
 * Database class to handle database queries
 *
 * @class Database
 */
class Database {
    /**
     * Database connection object
     *
     * @private
     * @type {Pool}
     * @memberof Database
     */
    private conn: Pool;

    constructor() {
        this.conn = createPool(mysqlConfig());
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
            typeof params === 'undefined' ? this.conn.query(sql, (err, results) => (err ? reject(err) : resolve(results))) : this.conn.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
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

export const database = new Database();
