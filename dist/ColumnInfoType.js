"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnInfoType = void 0;
class ColumnInfoType {
    get ColumnName() {
        return this.columnName;
    }
    get TableName() {
        return this.baseModel.TableName;
    }
    // get Columns(): { [key: string]: {name: string, type: ColumnType, length: number | null, attribute: ColumnAttributeType} } {
    //     return this.baseModel.Columns;
    // }
    // get ColumnInfo(): {name: string, type: ColumnType, length: number | null, attribute: ColumnAttributeType} {
    //     return this.Columns[this.ColumnName];
    // }
    get ColumnQuery() {
        return `"${this.baseModel.AsTableName}".${this.ColumnName}`;
    }
    constructor(columnName, baseModel) {
        this.columnName = columnName;
        this.baseModel = baseModel;
        const column = this.baseModel.Columns[this.ColumnName];
        if (column === null || column === undefined) {
            throw new Error(`${columnName}は${this.baseModel.TableName}テーブルに存在しません。`);
        }
    }
}
exports.ColumnInfoType = ColumnInfoType;
