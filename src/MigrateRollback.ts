import { Pool } from "pg";
import { MigrateTable } from "./MigrateTable";

export const migrate = async (migrates: Array<MigrateTable>, pool: Pool): Promise<void> => {

    // create migration table
    try {
        if (await isExistMigrationTable(pool) == false) {
            const sql = `
                CREATE TABLE migrations (
                    migration_number int,
                    script_file VARCHAR(50),
                    rollback_script VARCHAR(5000),
                    create_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );`;
            await pool.query(sql);
        }
    } catch (ex) {
        console.error('An error occurred related to the Migrate table:', ex);
        throw ex;
    }

    const client = await pool.connect();
    try {
        client.query('BEGIN');

        const datas = await getMigrations(pool);
        let maxNumber = datas.maxNumber;
        for (const migrate of migrates) {
            const className = migrate.constructor.name;
            await client.query(migrate.MigrateSql);

            const grantSql = migrate.AddGrantSql;
            if (grantSql !== null) {
                await client.query(grantSql);
            }
    
            const migrateInsertSql = `
                INSERT INTO migrations
                (migration_number, script_file, rollback_script)
                VALUES (${maxNumber + 1}, '${className}', '${migrate.RollbackSql}');
            `;
            maxNumber++;
    
            await client.query(migrateInsertSql);
    
            console.log(`Execution completed: ${className}`);
        }
        
        await client.query('COMMIT');
        
        console.log('Migration completed');
    } catch (ex) {
        await client.query('ROLLBACK');
        console.log('Migration failed.', ex);
    } finally {
        client.release();
        await pool.end();
    }
}

export const rollback = async (toNumber: number, pool: Pool): Promise<void> => {
    try {
        // If the migration table does not exist, there is no target for rollback, so do not perform it
        if (await isExistMigrationTable(pool) == false) {
          return;
        }
    } catch (ex) {
        console.error('An error occurred related to the Migrate table:', ex);
        return;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const datas = await getMigrations(pool);
        for (const data of datas.datas) {
            if (data.migration_number < toNumber) {
                break;
            }
            await client.query(data.rollback_script);
            await client.query(`DELETE FROM migrations WHERE migration_number = ${data.migration_number}`);
  
            console.log(`Execution completed: ${data.script_file}`);
        }
  
        await client.query('COMMIT');

        console.log('Rollback completed');
    } catch (ex) {
        await client.query('ROLLBACK');
        console.error('Rollback failed', ex);
    } finally {
        client.release();
        await pool.end();
    }
}

const isExistMigrationTable = async (pool: Pool) => {
    const existMigrationTableSql = `
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'migrations'
        );
    `;
    const res = await pool.query(existMigrationTableSql);
    return res.rows[0].exists;
}

const getMigrations = async (pool: Pool): Promise<{datas: Array<{migration_number: number, script_file: string, rollback_script: string}>, maxNumber: number}> => {
    const datas = await pool.query("SELECT * FROM migrations;");
    return {
        maxNumber: datas.rows.reduce((max, data) => data.migration_number > max ? data.migration_number : max, 0),
        datas: datas.rows
    }
}