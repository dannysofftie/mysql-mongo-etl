#!/usr/bin/env node
import * as prompts from 'prompts';
import { Database, mysqlConfig } from './configs';
import { MongoConnection } from './configs/mongoconf';
import { Migrate } from './lib/migrate';

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
        message: 'Generate Typescript Mongoose schema models? y for yes and any other key for no',
        initial: 'y',
    },
];

(async () => {
    // @ts-ignore
    const mysqlConn = await new Database(mysqlConfig(await prompts(mysqlPrompts)));
    // @ts-ignore
    const mongoConn = await new MongoConnection(await prompts(mongoPrompts));
    await mongoConn.connect().catch((e) => process.exit());

    const migrate = await new Migrate({ mysqlconn: mysqlConn, mongodb: mongoConn.database });
    await migrate.retrieveModels();
    await migrate.retrieveMysqlData();
    // @ts-ignore
    // const schema = await prompts(schemaPrompts);

    // if (schema.generateschemas === 'y' || schema.generateschemas === 'yes') {
    await migrate.generateMongoSchemas();
    // }

    await migrate.populateMongo().catch((e) => process.exit());
})();
