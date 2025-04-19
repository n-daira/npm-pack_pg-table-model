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
exports.MigrateDatabase = void 0;
class MigrateDatabase {
    get DbName() { return this.dbName; }
    get UserName() { return this.userName; }
    get Password() {
        return this.password;
    }
    constructor(dbName, userName, pool) {
        this.password = null;
        this.dbName = dbName;
        this.userName = userName;
        this.pool = pool;
    }
    IsExistUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT count(*) > 0 as is_exist
            FROM pg_roles
            WHERE rolname = '${this.UserName}';
        `;
            const datas = yield this.pool.query(sql);
            return datas.rows[0].is_exist;
        });
    }
    CreateUser() {
        return __awaiter(this, arguments, void 0, function* (password = '') {
            if (password.trim() === '') {
                password = '';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$%^&*_+|;:.<>?';
                for (let i = 0; i < 36; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    password += characters[randomIndex];
                }
            }
            this.password = password;
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
            yield this.pool.query(sql);
        });
    }
    IsExistDb() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT count(*) > 0 as is_exist
            FROM pg_database
            WHERE datname = '${this.DbName}';
        `;
            const datas = yield this.pool.query(sql);
            return datas.rows[0].is_exist;
        });
    }
    CreateDb() {
        return __awaiter(this, arguments, void 0, function* (collateType = 'C') {
            const sql = `
            CREATE DATABASE ${this.DbName}
                WITH OWNER = ${this.UserName}
                ENCODING = 'UTF8'
                LC_COLLATE = '${collateType}'
                LC_CTYPE = '${collateType}'
                CONNECTION LIMIT = -1;
        `;
            yield this.pool.query(sql);
        });
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
