"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollback = exports.migrate = void 0;
const migrate = (migrates, pool) => __awaiter(void 0, void 0, void 0, function* () {
    // create migration table
    try {
        if ((yield isExistMigrationTable(pool)) == false) {
            const sql = `
                CREATE TABLE migrations (
                    migration_number int,
                    script_file VARCHAR(50),
                    rollback_script VARCHAR(5000),
                    create_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );`;
            yield pool.query(sql);
        }
    }
    catch (ex) {
        console.error('An error occurred related to the Migrate table:', ex);
        throw ex;
    }
    const client = yield pool.connect();
    try {
        client.query('BEGIN');
        const datas = yield getMigrations(pool);
        let maxNumber = datas.maxNumber;
        for (const migrate of migrates) {
            const className = migrate.constructor.name;
            if (datas.datas.filter(data => data.script_file === className).length > 0) {
                console.log(`Already executed: ${className}`);
                continue;
            }
            yield client.query(migrate.MigrateSql);
            const grantSql = migrate.AddGrantSql;
            if (grantSql !== null) {
                yield client.query(grantSql);
            }
            const migrateInsertSql = `
                INSERT INTO migrations
                (migration_number, script_file, rollback_script)
                VALUES (${maxNumber + 1}, '${className}', '${migrate.RollbackSql}');
            `;
            maxNumber++;
            yield client.query(migrateInsertSql);
            console.log(`Execution completed: ${className}`);
        }
        yield client.query('COMMIT');
        console.log('Migration completed');
    }
    catch (ex) {
        yield client.query('ROLLBACK');
        console.log('Migration failed.', ex);
    }
    finally {
        client.release();
        yield pool.end();
    }
});
exports.migrate = migrate;
const rollback = (toNumber, pool) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // If the migration table does not exist, there is no target for rollback, so do not perform it
        if ((yield isExistMigrationTable(pool)) == false) {
            return;
        }
    }
    catch (ex) {
        console.error('An error occurred related to the Migrate table:', ex);
        return;
    }
    const client = yield pool.connect();
    try {
        yield client.query('BEGIN');
        const datas = yield getMigrations(pool);
        for (const data of datas.datas) {
            if (data.migration_number < toNumber) {
                break;
            }
            yield client.query(data.rollback_script);
            yield client.query(`DELETE FROM migrations WHERE migration_number = ${data.migration_number}`);
            console.log(`Execution completed: ${data.script_file}`);
        }
        yield client.query('COMMIT');
        console.log('Rollback completed');
    }
    catch (ex) {
        yield client.query('ROLLBACK');
        console.error('Rollback failed', ex);
    }
    finally {
        client.release();
        yield pool.end();
    }
});
exports.rollback = rollback;
const isExistMigrationTable = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    const existMigrationTableSql = `
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'migrations'
        );
    `;
    const res = yield pool.query(existMigrationTableSql);
    return res.rows[0].exists;
});
const getMigrations = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    const datas = yield pool.query("SELECT * FROM migrations ORDER BY migration_number DESC;");
    return {
        maxNumber: datas.rows.reduce((max, data) => data.migration_number > max ? data.migration_number : max, 0),
        datas: datas.rows
    };
});
