import { Migrate } from './src';

const args = process.argv.slice(2);

// invoke
const d = (async () => {
    const migrate = new Migrate();
    await migrate.retrieveModels();
    await migrate.retrieveMysqlData();
    await migrate.generateMongoSchemas();
})();
