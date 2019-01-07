export interface IMysqlConfig {
    mysqlusername: string;
    mysqlhost: string;
    mysqlpassword: string;
    mysqldatabase: string;
}

export interface IMongoConfig {
    mongousername: string;
    mongohost: string;
    mongopassword: string;
    mongodatabase: string;
}

export function mysqlConfig(options?: IMysqlConfig): string {
    try {
        return `mysql://${options.mysqlusername.trim()}:${options.mysqlpassword.trim()}@${options.mysqlhost.trim()}:3306/${options.mysqldatabase.trim()}?connectionLimit=10&dateStrings=true`;
    } catch (e) {
        return process.exit();
    }
}

export function mongoConfig(options?: IMongoConfig): string {
    try {
        return new RegExp(/^(?:(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(\.(?!$)|$)){4}$/).test(options.mongohost)
            ? `mongodb://${options.mongousername.trim()}:${options.mongopassword.trim()}@${options.mongohost.trim()}/${options.mongodatabase.trim()}?retryWrites=true`
            : `mongodb+srv://${options.mongousername.trim()}:${options.mongopassword.trim()}@${options.mongohost.trim()}/${options.mongodatabase.trim()}?retryWrites=true`;
    } catch (e) {
        return process.exit();
    }
}

export * from './mysqlconf';
