import { IMongoConfig, mongoConfig } from '.';
import * as ora from 'ora';
import { MongoClient, Db } from 'mongodb';

export class MongoConnection {
    public database: Db;

    public connection: MongoClient;

    private options: IMongoConfig;

    constructor(options: IMongoConfig) {
        this.options = options;
    }

    public connect(): Promise<MongoClient> {
        const spinner = ora('Establishing MongoDB connection').start();
        return new Promise((resolve) => {
            MongoClient.connect(
                mongoConfig(this.options),
                { useNewUrlParser: true },
                (err, client) => {
                    if (err) {
                        spinner.fail(`MongoDB connection error ${err.message}`).stop();
                        process.exit();
                    }
                    spinner.succeed('MongoDB connection established. Press any key to continue. \n').stop();
                    this.connection = client;
                    this.database = this.connection.db(this.options.mongodatabase);
                    resolve(client);
                },
            );
        });
    }
}
