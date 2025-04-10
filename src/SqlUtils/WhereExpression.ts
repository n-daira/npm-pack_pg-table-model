import { TableModel } from "../TableModel";
import { TColumnInfo, TColumnType, TNestedCondition, TOperator, TQuery, TSqlValue } from "../Type";
import SqlUtil from "./SqlUtils";
import ValidateValueUtil from "./ValidateValueUtil";

export default class WhereExpression {

    static create(left: TColumnInfo, operator: TOperator, right: TSqlValue | null | Array<TSqlValue> | TColumnInfo, varLength: number) : TQuery {

        // 指定したColumnInfoは存在するかのチェックも兼ねている
        const leftColumn = SqlUtil.getColumnInfo(left);

        // 演算子はそれぞれ正しいか？
        const useableOperator: { [key in TColumnType]: string[] } = {
            number: ["=", "!=", ">", ">=", "<", "<=", "in", "not in"],
            string: ["=", "!=", "like", "ilike", "h2f_like", "h2f_ilike", "in", "not in"],
            uuid: ["=", "!=", "in", "not in"],
            bool: ["=", "!=", "in", "not in"],
            date: ["=", "!=", ">", ">=", "<", "<="],
            time: ["=", "!=", ">", ">=", "<", "<="],
            timestamp: ["=", "!=", ">", ">=", "<", "<="]
        };

        if (useableOperator[leftColumn.type].includes(operator) == false) {
            throw new Error(`${leftColumn.tableName}.${leftColumn.columnName}は${operator}演算子を使用することはできません。(${leftColumn.type})`);
        }

        // IN NOT IN句
        if (["in", "not in"].includes(operator)) {
            if (Array.isArray(right) == false) {
                throw new Error(`in演算子の場合、右辺に配列以外を入力することはできません。`);
            }

            if (right.length == 0) {
                // 配列が0個の場合にin ,not inを作成するとエラーになるが、渡すデータとしてはあっており、
                // データ返却の期待値は変わらないため、0個の場合は検索しないようにする
                return { sql: '' };
            }
            
            // 値のバリデーションチェック
            for (const value of right) {
                ValidateValueUtil.validateValue(leftColumn, value);
            }
            return {
                sql: `${leftColumn.expression} ${operator === 'in' ? '=' : '!='} ANY($${varLength})`,
                vars: [right]
            }
        } else if (Array.isArray(right)) {
            throw new Error(`in演算子以外の場合、右辺に配列を入力することはできません。`);
        }

        // 右側の値がコラム指定の場合
        if (right !== null && typeof right === 'object' && 'model' in right && 'name' in right) {
            const rightColumn = SqlUtil.getColumnInfo(right);

            if (leftColumn.type !== rightColumn.type) {
                throw new Error(`[${leftColumn.tableName}].[${leftColumn.columnName}]と[${rightColumn.tableName}].[${rightColumn.columnName}]はそれぞれtypeが異なります。`);
            }

            // LIKE演算子は変わるので別途処理
            switch (operator) {
                case 'like':
                case 'ilike':
                    return {
                        sql: `${leftColumn.expression} ${operator} '%' || ${rightColumn.expression} || '%'`
                    }
                case 'h2f_like': // half to full like
                case 'h2f_ilike': // half to full ilike
                return {
                    sql: `${this.makeSqlReplaceHalfToFull(leftColumn.expression)} ${operator.replace("h2f_", "")} ${this.makeSqlReplaceHalfToFull(`'%' || ${rightColumn.expression} || '%'`)}`
                }
            }

            return {
                sql: `${leftColumn.expression} ${operator} ${rightColumn.expression}`
            }
        }

        if (right === null) {
            if (operator == "=") {
                return {
                    sql: `${leftColumn.expression} is null`
                }
            } else if (operator == "!=") {
                return {
                    sql: `${leftColumn.expression} is not null`
                }
            } else {
                throw new Error(`nullで比較する場合、=, !=以外の演算子は使えません。(${operator})`);
            }
        }

        ValidateValueUtil.validateValue(leftColumn, right);
        // LIKE演算子は変わるので別途処理
        switch (operator) {
            case 'like':
            case 'ilike':
                return {
                    sql: `${leftColumn.expression} ${operator} $${varLength}`,
                    vars: [`%${right}%`]
                }
            case 'h2f_like': // half to full like
            case 'h2f_ilike': // half to full ilike
                return {
                    sql: `${this.makeSqlReplaceHalfToFull(leftColumn.expression)} ${operator.replace("h2f_", "")} ${this.makeSqlReplaceHalfToFull(`$${varLength}`)}`,
                    vars: [`%${right}%`]
                }
        }

        return {
            sql: `${leftColumn.expression} ${operator} $${varLength}`,
            vars: [right]
        }
    }

    /**
     * OR条件を作成するためのヘルパーメソッド
     * @param conditions OR条件を構成する条件の配列
     * @returns OR条件を表すSQLクエリ文字列
     */
    static createCondition(conditions: Array<TNestedCondition>, model: TableModel, varLength: number): TQuery {

        if (conditions.length === 0) {
            return { sql: '' };
        }
    
        let logicalOperator = 'AND';
        if (conditions[0] === 'AND' || conditions[0] === 'OR') {
            if (conditions.length === 1) {
                return { sql: '' };
            }
            
            logicalOperator = conditions[0];
            conditions.shift();
        }

        const expression: string[] = [];
        let vars: any[] = []
        for (let condition of conditions) {
            if (Array.isArray(condition)) {
                // 配列の場合はネストした条件になるため、再起的にこの関数を呼び出す
                const query = this.createCondition(condition, model, varLength + vars.length);
                expression.push(query.sql);
                if (query.vars !== undefined) {
                    vars = [...vars, ...query.vars];
                }
                continue;
            }

            if (typeof condition === 'string') {
                // 文字列で直接指定した場合はクエリ分となるため、そのまま挿入
                expression.push(condition);
                continue;
            }

            if (typeof condition.l === 'string') {
                const query = this.create({ model: model, name: condition.l}, condition.o, condition.r, varLength + vars.length);
                expression.push(query.sql);
                if (query.vars !== undefined) {
                    vars = [...vars, ...query.vars];
                }
                continue;
            }

            const query = this.create(condition.l, condition.o, condition.r, varLength + vars.length);
            expression.push(query.sql);
            if (query.vars !== undefined) {
                vars = [...vars, ...query.vars];
            }
        }

        return {
            sql: `(${expression.filter(condition => condition ?? '' !== '').join(` ${logicalOperator} `)})`,
            vars: vars
        }
    }

    /**
     * 半角文字を全角に変換するSQL文
     * @param {string} columnName カラム名
     * @returns SQL文
     */
    private static makeSqlReplaceHalfToFull(columnNameOrValue: string) {
        const num = {
            '０' : '0', '１' : '1', '２' : '2', '３' : '3', '４' : '4',
            '５' : '5', '６' : '6', '７' : '7', '８' : '8', '９' : '9'
        };

        const kana = {
            'ア' : 'ｱ', 'イ' : 'ｲ', 'ウ' : 'ｳ', 'エ' : 'ｴ', 'オ' : 'ｵ',
            'カ' : 'ｶ', 'キ' : 'ｷ', 'ク' : 'ｸ', 'ケ' : 'ｹ', 'コ' : 'ｺ',
            'サ' : 'ｻ', 'シ' : 'ｼ', 'ス' : 'ｽ', 'セ' : 'ｾ', 'ソ' : 'ｿ',
            'タ' : 'ﾀ', 'チ' : 'ﾁ', 'ツ' : 'ﾂ', 'テ' : 'ﾃ', 'ト' : 'ﾄ',
            'ナ' : 'ﾅ', 'ニ' : 'ﾆ', 'ヌ' : 'ﾇ', 'ネ' : 'ﾈ', 'ノ' : 'ﾉ',
            'ハ' : 'ﾊ', 'ヒ' : 'ﾋ', 'フ' : 'ﾌ', 'ヘ' : 'ﾍ', 'ホ' : 'ﾎ',
            'マ' : 'ﾏ', 'ミ' : 'ﾐ', 'ム' : 'ﾑ', 'メ' : 'ﾒ', 'モ' : 'ﾓ',
            'ヤ' : 'ﾔ', 'ユ' : 'ﾕ', 'ヨ' : 'ﾖ',
            'ラ' : 'ﾗ', 'リ' : 'ﾘ', 'ル' : 'ﾙ', 'レ' : 'ﾚ', 'ロ' : 'ﾛ',
            'ワ' : 'ﾜ', 'ヲ' : 'ｦ', 'ン' : 'ﾝ',
            'ヴ' : 'ｳﾞ',
            'ガ' : 'ｶﾞ', 'ギ' : 'ｷﾞ', 'グ' : 'ｸﾞ', 'ゲ' : 'ｹﾞ', 'ゴ' : 'ｺﾞ',
            'ザ' : 'ｻﾞ', 'ジ' : 'ｼﾞ', 'ズ' : 'ｽﾞ', 'ゼ' : 'ｾﾞ', 'ゾ' : 'ｿﾞ',
            'ダ' : 'ﾀﾞ', 'ヂ' : 'ﾁﾞ', 'ヅ' : 'ﾂﾞ', 'デ' : 'ﾃﾞ', 'ド' : 'ﾄﾞ',
            'バ' : 'ﾊ', 'ビ' : 'ﾋﾞ', 'ブ' : 'ﾌﾞ', 'ベ' : 'ﾍﾞ', 'ボ' : 'ﾎﾞ',
            'パ' : 'ﾊﾟ', 'ピ' : 'ﾋﾟ', 'プ' : 'ﾌﾟ', 'ペ' : 'ﾍﾟ', 'ポ' : 'ﾎﾟ',
            'ァ' : 'ｧ', 'ィ' : 'ｨ', 'ゥ' : 'ｩ', 'ェ' : 'ｪ', 'ォ' : 'ｫ',
            'ャ' : 'ｬ', 'ュ' : 'ｭ', 'ョ' : 'ｮ',
            'ッ' : 'ｯ',
            'ー' : 'ｰ', '、' : '､', '。' : '｡', '・' : '･', '「' : '｢', '」' : '｣', '゛' : ' ﾞ', '゜' : ' ﾟ'
        };

        const alpha = {
            'Ａ' : 'A', 'Ｂ' : 'B', 'Ｃ' : 'C', 'Ｄ' : 'D', 'Ｅ' : 'E', 'Ｆ' : 'F', 'Ｇ' : 'G',
            'Ｈ' : 'H', 'Ｉ' : 'I', 'Ｊ' : 'J', 'Ｋ' : 'K', 'Ｌ' : 'L', 'Ｍ' : 'M', 'Ｎ' : 'N',
            'Ｏ' : 'O', 'Ｐ' : 'P', 'Ｑ' : 'Q', 'Ｒ' : 'R', 'Ｓ' : 'S', 'Ｔ' : 'T', 'Ｕ' : 'U',
            'Ｖ' : 'V', 'Ｗ' : 'W', 'Ｘ' : 'X', 'Ｙ' : 'Y', 'Ｚ' : 'Z',
            'ａ' : 'a', 'ｂ' : 'b', 'ｃ' : 'c', 'ｄ' : 'd', 'ｅ' : 'e', 'ｆ' : 'f', 'ｇ' : 'g',
            'ｈ' : 'h', 'ｉ' : 'i', 'ｊ' : 'j', 'ｋ' : 'k', 'ｌ' : 'l', 'ｍ' : 'm', 'ｎ' : 'n',
            'ｏ' : 'o', 'ｐ' : 'p', 'ｑ' : 'q', 'ｒ' : 'r', 'ｓ' : 's', 'ｔ' : 't', 'ｕ' : 'u',
            'ｖ' : 'v', 'ｗ' : 'w', 'ｘ' : 'x', 'ｙ' : 'y', 'ｚ' : 'z',
        };

        let objs: { [key: string]: string } = {};
        Object.assign(objs, num);
        Object.assign(objs, kana);
        Object.assign(objs, alpha);

        let sql = columnNameOrValue;
        Object.keys(objs).forEach(key => sql = `TRANSLATE(${sql} ,'${key}','${objs[key]}')`);

        return sql;
    }
}