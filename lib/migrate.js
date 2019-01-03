"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const datatypes_1 = require("./datatypes");
const ora = require("ora");
/**
 * Database migration utility. WIll migrate data from MySQL to MongoDb,
 * MySQL this.mysqldb name will be retained. All MySQL table names will be mapped to MongoDb collections,
 * MySQL model relationships will not be reinforced since MongoDB does not support schema relationships
 *
 * @export
 * @class Migrate
 */
class Migrate {
    constructor(options) {
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
    async retrieveModels() {
        const modelInfo = await this.mysqldb.query(`show full tables where Table_Type = 'BASE TABLE'`);
        this.models = modelInfo.map((res) => {
            return res[Object.keys(res)[0]];
        });
    }
    /**
     * Retrieve data for each model from MySQL, and generate corresponding data file in json.
     *
     * @memberof Migrate
     */
    async retrieveMysqlData() {
        var e_1, _a, e_2, _b;
        if (this.models === undefined) {
            throw new Error(`Call retrieveModels to get MySQL models!`);
        }
        try {
            const files = await fs.readdirSync(this.datafilesdir);
            if (files.length) {
                try {
                    for (var files_1 = __asyncValues(files), files_1_1; files_1_1 = await files_1.next(), !files_1_1.done;) {
                        const file = files_1_1.value;
                        fs.unlinkSync(this.datafilesdir + file);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (files_1_1 && !files_1_1.done && (_a = files_1.return)) await _a.call(files_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        catch (_c) {
            fs.mkdirSync(this.datafilesdir);
        }
        try {
            for (var _d = __asyncValues(this.models), _e; _e = await _d.next(), !_e.done;) {
                const model = _e.value;
                const modelData = await this.mysqldb.query(`select * from ${model}`);
                fs.writeFileSync(`${this.datafilesdir + model}.json`, JSON.stringify(modelData));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_b = _d.return)) await _b.call(_d);
            }
            finally { if (e_2) throw e_2.error; }
        }
        console.log(`Found ${this.models.length} models and ` + 'wrote into json files in ' + Math.floor(process.uptime()) + 's and ', process
            .uptime()
            .toString()
            .split('.')[1] + 'ms\nMapping into MongoDB collections ....');
    }
    /**
     * Generate MongoDB Schemas with corresponding data types as from MySQL. These schemas will used to populate data into MongoDB.
     *
     * Can be used later for another project, or deleted if not needed elsewhere anyways. Most common use case will be when taking over
     * a Node.js project using TypeScript.
     *
     * @memberof Migrate
     */
    async generateMongoSchemas() {
        var e_3, _a, e_4, _b;
        const schemafiles = fs.readdirSync(this.datafilesdir);
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
        }
        catch (error) { }
        try {
            for (var schemafiles_1 = __asyncValues(schemafiles), schemafiles_1_1; schemafiles_1_1 = await schemafiles_1.next(), !schemafiles_1_1.done;) {
                const schemafile = schemafiles_1_1.value;
                let modelname = schemafile.split('.')[0];
                const definition = await this.mysqldb.query(`describe ${modelname}`);
                if (modelname.indexOf('_') !== -1) {
                    modelname = modelname.split('_').join('');
                }
                modelname = modelname.slice(0, 1).toUpperCase() + modelname.slice(1);
                // add key value pairs to modelschemas, to map data-files to their corresponding mongo-model files
                this.modelschemas.set(schemafile, modelname);
                try {
                    fs.mkdirSync(this.modelsdirectory);
                }
                catch (_c) {
                    // do nothing if `models` directory exists
                }
                finally {
                    const model = fs.createWriteStream(`${this.modelsdirectory + modelname}.ts`);
                    model.write(`import { Schema, model } from 'mongoose';\n\n`);
                    let modeldefinition = '';
                    try {
                        for (var definition_1 = __asyncValues(definition), definition_1_1; definition_1_1 = await definition_1.next(), !definition_1_1.done;) {
                            const field = definition_1_1.value;
                            const datatype = field.Type.indexOf('(') !== -1 ? field.Type.split('(')[0] : field.Type;
                            modeldefinition += `
                    ${field.Field}: {
                            type: ${datatypes_1.default[datatype]},
                            required: ${field.Null === 'YES' ? false : true},
                            default: ${field.Default === 'CURRENT_TIMESTAMP' ? 'Date.now' : field.Default},
                    },`;
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (definition_1_1 && !definition_1_1.done && (_b = definition_1.return)) await _b.call(definition_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                    model.write(`const ${modelname} = new Schema({${modeldefinition}});`);
                    model.write(`\n\n\n\nexport default model('${modelname}', ${modelname});\n`);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (schemafiles_1_1 && !schemafiles_1_1.done && (_a = schemafiles_1.return)) await _a.call(schemafiles_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    /**
     * Write / populate retrieved data into MongoDB, using previously generated Schemas and json data files.
     *
     * @returns {Promise<void>}
     * @memberof Migrate
     */
    async populateMongo() {
        var e_5, _a, e_6, _b;
        if (this.modelschemas.size) {
            let counter = 0;
            const spinner = ora('Started data migration').start();
            spinner.color = 'blue';
            try {
                for (var _c = __asyncValues(this.modelschemas), _d; _d = await _c.next(), !_d.done;) {
                    const datafile = _d.value;
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
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) await _a.call(_c);
                }
                finally { if (e_5) throw e_5.error; }
            }
            if (counter === this.modelschemas.size) {
                console.log('\n');
                spinner.succeed('Complete! Dumped into MongoDB. Empty MySQL schemas were ignored.');
                try {
                    const files = await fs.readdirSync(this.datafilesdir);
                    if (files.length) {
                        try {
                            for (var files_2 = __asyncValues(files), files_2_1; files_2_1 = await files_2.next(), !files_2_1.done;) {
                                const file = files_2_1.value;
                                fs.unlinkSync(this.datafilesdir + file);
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (files_2_1 && !files_2_1.done && (_b = files_2.return)) await _b.call(files_2);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                    }
                }
                catch (e) {
                    //
                }
                process.exit();
            }
        }
    }
}
exports.Migrate = Migrate;
