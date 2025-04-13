"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateTable = void 0;
class MigrateTable {
    get MigrateSql() { return this.trimSpaceLineSql(this.migrateSql); }
    get RollbackSql() { return this.trimSpaceLineSql(this.rollbackSql); }
    get AddGrantSql() {
        if (this.user.trim() === "") {
            return null;
        }
        const tables = this.addGrantTables.filter(table => table.trim() !== '');
        if (tables.length === 0) {
            return null;
        }
        let sql = "";
        for (const table of tables) {
            sql += `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.${table} TO ${this.user};`;
        }
        return sql;
    }
    constructor() {
        this.migrateSql = '';
        this.rollbackSql = '';
        this.addGrantTables = [];
        this.user = '';
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
exports.MigrateTable = MigrateTable;
