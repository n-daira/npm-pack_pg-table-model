import { TColumnAttribute, TColumnInfo, TColumnType, TOperator } from "../Type";

export default class SqlUtil {

    /**
     * Retrieves column information.
     * カラム情報を取得します。
     * @param column Column information.
     *               カラム情報
     * @returns Column information object.
     *          カラム情報オブジェクト
     */
    static getColumnInfo(column: TColumnInfo) {
        if (column.name in column.model.Columns === false) {
            throw new Error(`${column.model.TableName}に${column.name}は存在しません。`);
        }

        return column.model.Columns[column.name];
    }

    /**
     * Converts a column to a SQL query string.
     * カラムをSQLクエリ文字列に変換します。
     * @param column - The column information.
     *                 カラム情報。
     * @returns The SQL query string.
     *          SQLクエリ文字列。
     */
    static toColumnQuery(column: TColumnInfo) {
        if (column.name in column.model.Columns === false) {
            throw new Error(`${column.model.TableName}に${column.name}は存在しません。`);
        }
        return `"${column.model.AsTableName}".${column.name}`;
    }
}