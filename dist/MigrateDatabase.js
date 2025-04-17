"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateDatabase = void 0;
class MigrateDatabase {
    get DbName() { return this.dbName; }
    get UserName() { return this.userName; }
    constructor(dbName, userName) {
        this.dbName = dbName;
        this.userName = userName;
    }
    CheckExistUser() {
        const sql = `
            SELECT count(*) > 0
            FROM pg_roles
            WHERE rolname = '${this.UserName}';
        `;
        return this.trimSpaceLineSql(sql);
    }
    CreateUserSql(password = '') {
        if (password.trim() === '') {
            password = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                password += characters[randomIndex];
            }
        }
        const sql = `
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT FROM pg_catalog.pg_roles WHERE rolname = '${this.UserName}'
                ) THEN
                    CREATE USER ${this.UserName} WITH PASSWORD '${password}';
                END IF;
            END
            $$;

            GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${this.UserName};

            ALTER DEFAULT PRIVILEGES IN SCHEMA public
            GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${this.UserName};
        `;
        return this.trimSpaceLineSql(sql);
    }
    CheckExistDb() {
        const sql = `
            SELECT count(*) > 0
            FROM pg_database
            WHERE datname = '${this.UserName}';
        `;
        return this.trimSpaceLineSql(sql);
    }
    CreateDbSql(collateType = 'C') {
        const sql = `
            CREATE DATABASE ${this.DbName}
                WITH OWNER = ${this.UserName}
                ENCODING = 'UTF8'
                LC_COLLATE = '${collateType}'
                LC_CTYPE = '${collateType}'
                CONNECTION LIMIT = -1;
        `;
        return this.trimSpaceLineSql(sql);
    }
    RollbackDbSql() {
        const sql = `
            -- ${this.DbName}データベースに接続しているすべてのセッションを強制終了
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = '${this.DbName}';

            -- DB削除
            DROP DATABASE IF EXISTS ${this.DbName};`;
        return this.trimSpaceLineSql(sql);
    }
    RollbackUserSql(otherUserName) {
        const sql = `
            -- 1. すべてのセッションを強制終了
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE usename = '${this.UserName}';

            -- 2. 所有オブジェクトを ${otherUserName} に移行
            REASSIGN OWNED BY ${this.UserName} TO ${otherUserName};

            -- 2. すべての権限を削除
            DROP OWNED BY ${this.UserName} CASCADE;

            -- 3. ロールを削除
            DROP ROLE IF EXISTS ${this.UserName};`;
        return this.trimSpaceLineSql(sql);
    }
    trimSpaceLineSql(str) {
        const splitLines = str.split('\n');
        let sql = '';
        for (let line of splitLines) {
            line = line.replace(/\s+/g, ' ').trim(); // 複数のスペースを一つに置き換え
            if (line.startsWith('--') && sql[sql.length - 1] != '\n') {
                line = '\n' + line;
            }
            if (line.length > 0) {
                if (line.includes('--') === false) {
                    sql += line + ' ';
                }
                else {
                    sql += line + '\n';
                }
            }
        }
        return sql;
    }
}
exports.MigrateDatabase = MigrateDatabase;
