if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

export function mysqlConfig(): string {
    return `mysql://${process.env.MYSQL_USERNAME}:${process.env.MYSQL_PASSOWRD}@${process.env.MYSQL_HOST}:3306/${process.env.MYSQL_DATABASE}?connectionLimit=10&dateStrings=true`;
}

export function mongoConfig(): string {
    return `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DATABASE}`;
}

export const dbname = process.env.MONGO_DATABASE;
