import { Migrate } from './src';

const args = process.argv.slice(2);
const options = {
    '--database': '',
    '--action': '',
};

(async () => {
    const migrate = new Migrate();
    await migrate.retrieveModels();
    await migrate.retrieveMysqlData();
})();
