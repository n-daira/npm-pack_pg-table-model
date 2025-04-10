import { TableModel } from "../TableModel";
import { TQuery } from "../Type";

export default class QueryUtil {

    /**
     * Creates an SQL insert statement.
     * SQL挿入文を作成します。
     * @param options The options for the insert operation.
     *                挿入のオプション。
     * @param tableName The name of the table to insert into.
     *                  挿入するテーブルの名前。
     * @returns An object containing the SQL string and the variables.
     *          SQL文字列と変数を含むオブジェクト。
     */
    static createInsert(options: {[key: string]: any}, tableName: string) : TQuery {
        const insertColumns: Array<string> = [];
        const insertValues: Array<any> = [];
        const insertVar: Array<string> = [];

        for (const [key, value] of Object.entries(options)) {
            if (value === undefined || value === null) {
                continue;
            }

            insertColumns.push(key);
            insertValues.push(value)
            insertVar.push(`$${insertVar.length + 1}`);
        }

        return {
            sql: `INSERT INTO ${tableName} (${insertColumns.join(",")}) VALUES (${insertVar.join(",")});`,
            vars: insertValues
        }
    }

    /**
     * Updates a record by its ID.
     * IDでレコードを更新します。
     * 
     * @param id The ID of the record to update.
     *           更新するレコードのID。
     * @param options The options for the update operation.
     *                更新のオプション。
     * @param tableModel The table model instance.
     *                   テーブルモデルのインスタンス。
     * @returns An object containing the SQL string and the variables.
     *          SQL文字列と変数を含むオブジェクト。
     */
    static createUpdateId(id: any, options: {[key: string]: any}, tableModel: TableModel) : TQuery {
        const updateAlias: Array<string> = [];
        const vars: Array<any> = [];

        for (const [key, value] of Object.entries(options)) {
            if (key in tableModel.Columns === false) {
                throw new Error(`${key}は${tableModel.TableName}に存在しません。`);
            }

            if (value === undefined) {
                throw new Error(`${key}はundefinedになっています。`);
            }

            const column = tableModel.Columns[key];
            if (column.attribute === 'primary') {
                throw new Error(`primary keyである${tableModel.TableName}.${key}は変更できません。`);
            }

            vars.push(value);
            updateAlias.push(`${key} = $${vars.length}`);
        }

        vars.push(id);
        return {
            sql: `UPDATE ${tableModel.TableName} SET ${updateAlias.join(',')} WHERE id = $${vars.length}`,
            vars: vars
        }
    }
}