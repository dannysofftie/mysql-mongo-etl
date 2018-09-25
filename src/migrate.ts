import { database } from '../configs/dbconfig';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Database migration utility. WIll migrate data from MySQL to MongoDb,
 * MySQL database name will be retained. All MySQL table names will be mapped to MongoDb collections,
 * MySQL model relationships will not be reinforced since MongoDB does not support schema relationships
 *
 * @export
 * @class Migrate
 */
export class Migrate {
    private models: string | any[];
    constructor() {
        //
    }

    /**
     * Retrieve all model names from provided database
     *
     * @memberof Migrate
     */
    public async retrieveModels(): Promise<void> {
        const modelInfo = await database.query(`show full tables where Table_Type = 'BASE TABLE'`);
        this.models = modelInfo.map((res) => {
            return res[Object.keys(res)[0]];
        });
    }

    /**
     * Retrieve data for each model from MySQL
     *
     * @memberof Migrate
     */
    public async retrieveMysqlData(): Promise<void> {
        if (this.models === undefined) {
            throw new Error(`Call retrieveModels to get MySQL models!`);
        }
        for await (const model of this.models) {
            const modelData = await database.query(`select * from ${model}`);
            fs.writeFileSync(path.join(__dirname, `../files/${model}.json`), JSON.stringify(modelData));
        }
        console.log(
            `Found ${this.models.length} models and ` + 'wrote into json files in ' + Math.floor(process.uptime()) + 's and ',
            process
                .uptime()
                .toString()
                .split('.')[1] + 'ms\nMapping into MongoDB collections ....',
        );
    }
}
