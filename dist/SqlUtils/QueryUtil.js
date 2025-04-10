"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryUtil {
    // static createUpdate(options) {
    // }
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
    static createUpdateId(id, options, tableModel) {
        const updateAlias = [];
        const vars = [];
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
        };
    }
}
exports.default = QueryUtil;
