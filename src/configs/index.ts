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
        return `mongodb://${options.mongousername.trim()}:${options.mongopassword.trim()}@${options.mongohost.trim()}:27017/${options.mongodatabase.trim()}`;
    } catch (e) {
        return process.exit();
    }
}

export * from './mysqlconf';
