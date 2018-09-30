import { database } from '../configs/dbconfig';
import * as fs from 'fs';
import * as path from 'path';
import datatypes from '../utils/datatypes';
import { Schema, Types } from 'mongoose';

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
    private path: string;
    private modelsPath: string;

    constructor() {
        this.path = path.join(__dirname, `../files/`);
        this.modelsPath = path.join(__dirname, `../models/`);
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
        try {
            const files = await fs.readdirSync(this.path);
            if (files.length) {
                for await (const file of files) {
                    fs.unlinkSync(this.path + file);
                }
            }
        } catch {
            fs.mkdirSync(this.path);
        }

        for await (const model of this.models) {
            const modelData = await database.query(`select * from ${model}`);
            fs.writeFileSync(`${this.path + model}.json`, JSON.stringify(modelData));
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
     * Generate MongoDB Schemas with corresponding data types as from MySQL
     *
     * @memberof Migrate
     */
    public async generateMongoSchemas(): Promise<void> {
        const schemaFiles: string[] = fs.readdirSync(this.path);
        if (schemaFiles.length < 1) {
            throw new Error('Empty directory!');
        }

        for await (const schema of schemaFiles) {
            let modelName: string = schema.split('.')[0];
            const definition: any[] = await database.query(`describe ${modelName}`);
            if (modelName.indexOf('_') !== -1) {
                modelName = modelName.split('_').join('');
            }
            modelName = modelName.slice(0, 1).toUpperCase() + modelName.slice(1);
            try {
                fs.mkdirSync(this.modelsPath);
            } catch {
                // do nothing if models directory exists
            } finally {
                const model: fs.WriteStream = fs.createWriteStream(`${this.modelsPath + modelName}.ts`);
                model.write(`import { Schema, model } from 'mongoose';\n\n`);

                let modelDefinition: string = '';

                for await (const field of definition) {
                    const datatype = field.Type.indexOf('(') !== -1 ? field.Type.split('(')[0] : field.Type;
                    modelDefinition += `
                    ${field.Field}: {
                            type: ${datatypes[datatype]},
                            required: ${field.Null === 'YES' ? false : true},
                            default: ${field.Default === 'CURRENT_TIMESTAMP' ? 'Date.now' : field.Default},
                    },`;
                }

                model.write(`const ${modelName} = new Schema({${modelDefinition}});`);
                model.write(`\n\n\n\nexport default model('${modelName}', ${modelName});\n`);
            }
        }
    }

    /**
     * Write / populate retrieved data into MongoDB, using generated Schemas
     *
     * @memberof Migrate
     */
    public async populateMongo(): Promise<void> {
        //
    }
}
