import { TableModel } from "../TableModel";
import { TAggregateFuncType, TColumnInfo } from "../Type";

export default class SelectExpression {

    /**
     * 指定されたカラム情報と関数を使用して、SQLのSELECT文を作成します。
     * @param columnInfoType カラム情報を含むオブジェクト。
     * @param func カラムに適用する関数名。nullの場合は関数を適用しません。
     * @returns SQLのSELECT文の文字列。
     */
    static create(columnInfo: TColumnInfo, func: TAggregateFuncType | null = null, alias: string = '') : string {

        const column = columnInfo.model.getColumn(columnInfo.name);
        let select = ''
        switch (column.type) {
            case 'date':
                select = this.createDateTime(columnInfo, 'date');
                break;
            case 'time':
                select = this.createDateTime(columnInfo, 'time');
                break;
            case 'timestamp':
                select = this.createDateTime(columnInfo, 'datetime');
                break;
            default:
                select = column.expression;
                break;
        }

        let aliasName = alias.trim() !== '' ? alias : columnInfo.name;
        if (func !== null) {
            aliasName = alias.trim() !== '' ? alias : func + '_' + columnInfo.name;
            select = `${func}(${select})`;
            switch (func) {
                case 'sum':
                case 'max':
                case 'min':
                case 'avg':
                case 'count':
                    // なぜかStringで返却されるため、INTでキャスト
                    select = `CAST(${select} as INTEGER)`;
                    break;
                default:
                    break;
            }
        }

        return `${select} as "${aliasName}"`;
    }

    /**
     * BaseModelからSELECTクエリを作成します。
     * @param baseModel クエリを作成するためのBaseModelオブジェクト。
     * @param isExcludeId trueの場合、idカラムを除外します。
     * @param isExcludeSystemTime trueの場合、システム時間のカラムを除外します。
     * @returns 作成されたSELECTクエリの文字列。
     */
    static createFromModel(model: TableModel) {
        const queries: Array<string> = [];
        for (const key of Object.keys(model.Columns)) {
            queries.push(this.create({model: model, name: key}));
        }

        return queries.join(',');
    }

    /**
     * Converts the specified column to a SQL string format.
     * 指定されたカラムをSQLの文字列形式に変換します。
     * @param column - The column information or a string containing the column name.
     *                 変換するカラム情報またはカラム名を含む文字列。
     * @param to - Specifies the target format. Either 'date', 'time', or 'datetime'.
     *             変換先の形式を指定します。'date'、'time'、または'datetime'のいずれか。
     * @returns The SQL string converted to the specified format.
     *          指定された形式に変換されたSQLの文字列。
     */
    static createDateTime(column: string | TColumnInfo, to: 'date' | 'time' | 'datetime') {
        const columnQuery = typeof column === 'string' ? column : column.model.getColumn(column.name).expression;
        switch (to) {
            case 'date':
                return `to_char(${columnQuery}, 'YYYY-MM-DD')`;
            case 'datetime':
                return `to_char(${columnQuery}, 'YYYY-MM-DD HH24:mi:ss')`;
            case 'time':
                return `to_char(${columnQuery}, 'HH24:mi:ss')`;
        }
    }
}