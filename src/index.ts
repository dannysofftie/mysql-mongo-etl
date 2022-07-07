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

(async () => {
    // @ts-ignore
    const mysqlConn = new Database(mysqlConfig(await prompts(mysqlPrompts)));
    // @ts-ignore
    const mongoConn = new MongoConnection(await prompts(mongoPrompts));
    await mongoConn.connect().catch(e => process.exit());

    const migrate = new Migrate({ mysqlconn: mysqlConn, mongodb: mongoConn.database });
    await migrate.retrieveModels();
    await migrate.retrieveMysqlData();
    await migrate.generateMongoSchemas();
    await migrate.populateMongo().catch(e => process.exit());
})();
