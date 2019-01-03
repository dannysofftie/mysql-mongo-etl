import * as fs from 'fs';
import * as mongo from 'mongodb';
import * as path from 'path';
import { Database } from '../configs';
import datatypes from './datatypes';
import * as ora from 'ora';

/**
 * Database migration utility. WIll migrate data from MySQL to MongoDb,
 * MySQL this.mysqldb name will be retained. All MySQL table names will be mapped to MongoDb collections,
 * MySQL model relationships will not be reinforced since MongoDB does not support schema relationships
 *
 * @export
 * @class Migrate
 */
export class Migrate {
    /**
     * Hold name of the models to be generated
     *
     * @private
     * @type {(string | any[])}
     * @memberof Migrate
     */
    private models: string | any[];

    /**
     * Directory where data is saved in json format. File names correspond to MySQL table names
     *
     * @private
     * @type {string}
     * @memberof Migrate
     */
    private datafilesdir: string;

    /**
     * Directory where generated models will be stored
     *
     * @private
     * @type {string}
     * @memberof Migrate
     */
    private modelsdirectory: string;

    /**
     * Store collection model names and their corresonding data files
     *
     * @private
     * @type {Map<string, string>}
     * @memberof Migrate
     */
    private modelschemas: Map<string, string>;

    private mysqldb: Database;

    private mongodb: mongo.Db;

    constructor(options: { mysqlconn: Database; mongodb: mongo.Db }) {
        this.datafilesdir = path.join(process.cwd(), `/data-files/`);
        this.modelsdirectory = path.join(process.cwd(), `/generated-schema-models/`);
        this.modelschemas = new Map();
        this.mysqldb = options.mysqlconn;
        this.mongodb = options.mongodb;
    }

    /**
     * Get table names from the selected / provided this.mysqldb.
     *
     * Will populate `this.models` property.
     *
     * @memberof Migrate
     */
    public async retrieveModels(): Promise<void> {
        const modelInfo = await this.mysqldb.query(`show full tables where Table_Type = 'BASE TABLE'`);
        this.models = modelInfo.map((res: { [x: string]: any }) => {
            return res[Object.keys(res)[0]];
        });
    }

    /**
     * Retrieve data for each model from MySQL, and generate corresponding data file in json.
     *
     * @memberof Migrate
     */
    public async retrieveMysqlData(): Promise<void> {
        if (this.models === undefined) {
            throw new Error(`Call retrieveModels to get MySQL models!`);
        }
        try {
            const files = await fs.readdirSync(this.datafilesdir);
            if (files.length) {
                for await (const file of files) {
                    fs.unlinkSync(this.datafilesdir + file);
                }
            }
        } catch {
            fs.mkdirSync(this.datafilesdir);
        }

        for await (const model of this.models) {
            const modelData = await this.mysqldb.query(`select * from ${model}`);
            fs.writeFileSync(`${this.datafilesdir + model}.json`, JSON.stringify(modelData));
        }
        console.log(
            `Found ${this.models.length} models and ` + 'wrote into json files in ' + Math.floor(process.uptime()) + 's and ',
            process
                .uptime()
                .toString()
                .split('.')[1] + 'ms\nMapping into MongoDB collections ....',
        );
    }

    /**
     * Generate MongoDB Schemas with corresponding data types as from MySQL. These schemas will used to populate data into MongoDB.
     *
     * Can be used later for another project, or deleted if not needed elsewhere anyways. Most common use case will be when taking over
     * a Node.js project using TypeScript.
     *
     * @memberof Migrate
     */
    public async generateMongoSchemas(): Promise<void> {
        const schemafiles: string[] = fs.readdirSync(this.datafilesdir);
        if (!schemafiles.length) {
            throw new Error('Empty directory!');
        }

        try {
            // delete previously generated models if any
            const models = fs.readdirSync(this.modelsdirectory);
            models.forEach((model) => {
                fs.unlinkSync(this.modelsdirectory + model);
            });
            // tslint:disable-next-line:no-empty
        } catch (error) {}

        for await (const schemafile of schemafiles) {
            let modelname: string = schemafile.split('.')[0];
            const definition: any[] = await this.mysqldb.query(`describe ${modelname}`);
            if (modelname.indexOf('_') !== -1) {
                modelname = modelname.split('_').join('');
            }
            modelname = modelname.slice(0, 1).toUpperCase() + modelname.slice(1);
            // add key value pairs to modelschemas, to map data-files to their corresponding mongo-model files
            this.modelschemas.set(schemafile, modelname);
            try {
                fs.mkdirSync(this.modelsdirectory);
            } catch {
                // do nothing if `models` directory exists
            } finally {
                const model: fs.WriteStream = fs.createWriteStream(`${this.modelsdirectory + modelname}.ts`);
                model.write(`import { Schema, model } from 'mongoose';\n\n`);

                let modeldefinition: string = '';

                for await (const field of definition) {
                    const datatype = field.Type.indexOf('(') !== -1 ? field.Type.split('(')[0] : field.Type;
                    modeldefinition += `
                    ${field.Field}: {
                            type: ${datatypes[datatype]},
                            required: ${field.Null === 'YES' ? false : true},
                            default: ${field.Default === 'CURRENT_TIMESTAMP' ? 'Date.now' : field.Default},
                    },`;
                }

                model.write(`const ${modelname} = new Schema({${modeldefinition}});`);
                model.write(`\n\n\n\nexport default model('${modelname}', ${modelname});\n`);
            }
        }
    }

    /**
     * Write / populate retrieved data into MongoDB, using previously generated Schemas and json data files.
     *
     * @returns {Promise<void>}
     * @memberof Migrate
     */
    public async populateMongo(): Promise<void> {
        if (this.modelschemas.size) {
            let counter = 0;
            const spinner = ora('Started data migration').start();
            spinner.color = 'blue';
            for await (const datafile of this.modelschemas) {
                const modeldata = fs.readFileSync(this.datafilesdir + datafile[0], 'utf-8');
                const data = Array.from(JSON.parse(modeldata));
                const collectionName = datafile[1].toLowerCase();

                if (data.length) {
                    const collection = this.mongodb.collection(collectionName);
                    await collection.insertMany(data, { ordered: true });
                    spinner.succeed('Inserted ' + data.length + ' documents into the ' + collectionName + ' collection.');
                }
                counter += 1;
            }

            if (counter === this.modelschemas.size) {
                console.log('\n');
                spinner.succeed('Complete! Dumped into MongoDB. Empty MySQL schemas were ignored.');
                try {
                    const files = await fs.readdirSync(this.datafilesdir);
                    if (files.length) {
                        for await (const file of files) {
                            fs.unlinkSync(this.datafilesdir + file);
                        }
                    }
                } catch (e) {
                    //
                }
                process.exit();
            }
        }
    }
}
