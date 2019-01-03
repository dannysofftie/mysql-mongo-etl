#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prompts = require("prompts");
const configs_1 = require("./configs");
const mongoconf_1 = require("./configs/mongoconf");
const migrate_1 = require("./lib/migrate");
const mysqlPrompts = [
    {
        type: 'text',
        name: 'mysqlhost',
        message: 'MySQL database host address?',
        initial: '127.0.0.1',
    },
    {
        type: 'text',
        name: 'mysqlusername',
        message: 'MySQL database authentication username?',
        initial: 'root',
    },
    {
        type: 'password',
        name: 'mysqlpassword',
        message: 'MySQL database authentication password?',
    },
    {
        type: 'text',
        name: 'mysqldatabase',
        message: 'MySQL database name?',
    },
];
const mongoPrompts = [
    {
        type: 'text',
        name: 'mongohost',
        message: 'MongoDB database host address?',
        initial: '127.0.0.1',
    },
    {
        type: 'text',
        name: 'mongousername',
        message: 'MongoDB authentication username?',
    },
    {
        type: 'password',
        name: 'mongopassword',
        message: 'MongoDB authentication password?',
    },
    {
        type: 'text',
        name: 'mongodatabase',
        message: 'MongoDB database name?',
    },
];
const schemaPrompts = [
    {
        type: 'text',
        name: 'generateschemas',
        message: 'Generate Typescript Mongoose schema models?',
        initial: 'false',
    },
];
(async () => {
    // @ts-ignore
    const mysqlConn = await new configs_1.Database(configs_1.mysqlConfig(await prompts(mysqlPrompts)));
    // @ts-ignore
    const mongoConn = await new mongoconf_1.MongoConnection(await prompts(mongoPrompts));
    await mongoConn.connect();
    const migrate = await new migrate_1.Migrate({ mysqlconn: mysqlConn, mongodb: mongoConn.database });
    await migrate.retrieveModels();
    // @ts-ignore
    const schema = await prompts(schemaPrompts);
    await migrate.retrieveMysqlData();
    if (Boolean(schema.generateschemas) === true) {
        await migrate.generateMongoSchemas();
    }
    await migrate.populateMongo();
})();
