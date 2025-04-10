"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ValidateValueUtil_1 = __importDefault(require("./ValidateValueUtil"));
class WhereExpression {
    static create(left, operator, right, varLength) {
        // Check if the specified ColumnInfo exists
        const leftColumn = left.model.getColumn(left.name);
        // Are the operators correct?
        const useableOperator = {
            number: ["=", "!=", ">", ">=", "<", "<=", "in", "not in"],
            string: ["=", "!=", "like", "ilike", "h2f_like", "h2f_ilike", "in", "not in"],
            uuid: ["=", "!=", "in", "not in"],
            bool: ["=", "!=", "in", "not in"],
            date: ["=", "!=", ">", ">=", "<", "<="],
            time: ["=", "!=", ">", ">=", "<", "<="],
            timestamp: ["=", "!=", ">", ">=", "<", "<="]
        };
        if (useableOperator[leftColumn.type].includes(operator) == false) {
            throw new Error(`The ${operator} operator cannot be used for ${leftColumn.tableName}.${leftColumn.columnName}. (${leftColumn.type})`);
        }
        // IN NOT IN clause
        if (["in", "not in"].includes(operator)) {
            if (Array.isArray(right) == false) {
                throw new Error(`For the 'in' operator, you cannot input anything other than an array on the right side.`);
            }
            if (right.length == 0) {
                // Creating in, not in with 0 elements will cause an error, but since the data to be passed is correct and the expected return value does not change, do not search if there are 0 elements
                return { sql: '' };
            }
            // Validate values
            for (const value of right) {
                ValidateValueUtil_1.default.validateValue(leftColumn, value);
            }
            return {
                sql: `${leftColumn.expression} ${operator === 'in' ? '=' : '!='} ANY($${varLength})`,
                vars: [right]
            };
        }
        else if (Array.isArray(right)) {
            throw new Error(`For operators other than 'in', you cannot input an array on the right side.`);
        }
        // If the right side value is a column specification
        if (right !== null && typeof right === 'object' && 'model' in right && 'name' in right) {
            const rightColumn = right.model.getColumn(right.name);
            if (leftColumn.type !== rightColumn.type) {
                throw new Error(`The types of [${leftColumn.tableName}].[${leftColumn.columnName}] and [${rightColumn.tableName}].[${rightColumn.columnName}] are different.`);
            }
            // LIKE operators are different, so handle separately
            switch (operator) {
                case 'like':
                case 'ilike':
                    return {
                        sql: `${leftColumn.expression} ${operator} '%' || ${rightColumn.expression} || '%'`
                    };
                case 'h2f_like': // half to full like
                case 'h2f_ilike': // half to full ilike
                    return {
                        sql: `${this.makeSqlReplaceHalfToFull(leftColumn.expression)} ${operator.replace("h2f_", "")} ${this.makeSqlReplaceHalfToFull(`'%' || ${rightColumn.expression} || '%'`)}`
                    };
            }
            return {
                sql: `${leftColumn.expression} ${operator} ${rightColumn.expression}`
            };
        }
        if (right === null) {
            if (operator == "=") {
                return {
                    sql: `${leftColumn.expression} is null`
                };
            }
            else if (operator == "!=") {
                return {
                    sql: `${leftColumn.expression} is not null`
                };
            }
            else {
                throw new Error(`When comparing with null, operators other than =, != cannot be used. (${operator})`);
            }
        }
        ValidateValueUtil_1.default.validateValue(leftColumn, right);
        // LIKE operators are different, so handle separately
        switch (operator) {
            case 'like':
            case 'ilike':
                return {
                    sql: `${leftColumn.expression} ${operator} $${varLength}`,
                    vars: [`%${right}%`]
                };
            case 'h2f_like': // half to full like
            case 'h2f_ilike': // half to full ilike
                return {
                    sql: `${this.makeSqlReplaceHalfToFull(leftColumn.expression)} ${operator.replace("h2f_", "")} ${this.makeSqlReplaceHalfToFull(`$${varLength}`)}`,
                    vars: [`%${right}%`]
                };
        }
        return {
            sql: `${leftColumn.expression} ${operator} $${varLength}`,
            vars: [right]
        };
    }
    /**
     * Helper method to create OR conditions
     * @param conditions Array of conditions that make up the OR condition
     * @returns SQL query string representing the OR condition
     */
    static createCondition(conditions, model, varLength) {
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
        const expression = [];
        let vars = [];
        for (let condition of conditions) {
            if (Array.isArray(condition)) {
                // If it's an array, it's a nested condition, so call this function recursively
                const query = this.createCondition(condition, model, varLength + vars.length);
                expression.push(query.sql);
                if (query.vars !== undefined) {
                    vars = [...vars, ...query.vars];
                }
                continue;
            }
            if (typeof condition === 'string') {
                // If specified directly as a string, it becomes a query, so insert as is
                expression.push(condition);
                continue;
            }
            if (typeof condition.l === 'string') {
                const query = this.create({ model: model, name: condition.l }, condition.o, condition.r, varLength + vars.length);
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
            sql: `(${expression.filter(condition => condition !== null && condition !== void 0 ? condition : '' !== '').join(` ${logicalOperator} `)})`,
            vars: vars
        };
    }
    /**
     * SQL statement to convert half-width characters to full-width
     * @param {string} columnName Column name
     * @returns SQL statement
     */
    static makeSqlReplaceHalfToFull(columnNameOrValue) {
        const num = {
            '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
            '５': '5', '６': '6', '７': '7', '８': '8', '９': '9'
        };
        const kana = {
            'ア': 'ｱ', 'イ': 'ｲ', 'ウ': 'ｳ', 'エ': 'ｴ', 'オ': 'ｵ',
            'カ': 'ｶ', 'キ': 'ｷ', 'ク': 'ｸ', 'ケ': 'ｹ', 'コ': 'ｺ',
            'サ': 'ｻ', 'シ': 'ｼ', 'ス': 'ｽ', 'セ': 'ｾ', 'ソ': 'ｿ',
            'タ': 'ﾀ', 'チ': 'ﾁ', 'ツ': 'ﾂ', 'テ': 'ﾃ', 'ト': 'ﾄ',
            'ナ': 'ﾅ', 'ニ': 'ﾆ', 'ヌ': 'ﾇ', 'ネ': 'ﾈ', 'ノ': 'ﾉ',
            'ハ': 'ﾊ', 'ヒ': 'ﾋ', 'フ': 'ﾌ', 'ヘ': 'ﾍ', 'ホ': 'ﾎ',
            'マ': 'ﾏ', 'ミ': 'ﾐ', 'ム': 'ﾑ', 'メ': 'ﾒ', 'モ': 'ﾓ',
            'ヤ': 'ﾔ', 'ユ': 'ﾕ', 'ヨ': 'ﾖ',
            'ラ': 'ﾗ', 'リ': 'ﾘ', 'ル': 'ﾙ', 'レ': 'ﾚ', 'ロ': 'ﾛ',
            'ワ': 'ﾜ', 'ヲ': 'ｦ', 'ン': 'ﾝ',
            'ヴ': 'ｳﾞ',
            'ガ': 'ｶﾞ', 'ギ': 'ｷﾞ', 'グ': 'ｸﾞ', 'ゲ': 'ｹﾞ', 'ゴ': 'ｺﾞ',
            'ザ': 'ｻﾞ', 'ジ': 'ｼﾞ', 'ズ': 'ｽﾞ', 'ゼ': 'ｾﾞ', 'ゾ': 'ｿﾞ',
            'ダ': 'ﾀﾞ', 'ヂ': 'ﾁﾞ', 'ヅ': 'ﾂﾞ', 'デ': 'ﾃﾞ', 'ド': 'ﾄﾞ',
            'バ': 'ﾊ', 'ビ': 'ﾋﾞ', 'ブ': 'ﾌﾞ', 'ベ': 'ﾍﾞ', 'ボ': 'ﾎﾞ',
            'パ': 'ﾊﾟ', 'ピ': 'ﾋﾟ', 'プ': 'ﾌﾟ', 'ペ': 'ﾍﾟ', 'ポ': 'ﾎﾟ',
            'ァ': 'ｧ', 'ィ': 'ｨ', 'ゥ': 'ｩ', 'ェ': 'ｪ', 'ォ': 'ｫ',
            'ャ': 'ｬ', 'ュ': 'ｭ', 'ョ': 'ｮ',
            'ッ': 'ｯ',
            'ー': 'ｰ', '、': '､', '。': '｡', '・': '･', '「': '｢', '」': '｣', '゛': ' ﾞ', '゜': ' ﾟ'
        };
        const alpha = {
            'Ａ': 'A', 'Ｂ': 'B', 'Ｃ': 'C', 'Ｄ': 'D', 'Ｅ': 'E', 'Ｆ': 'F', 'Ｇ': 'G',
            'Ｈ': 'H', 'Ｉ': 'I', 'Ｊ': 'J', 'Ｋ': 'K', 'Ｌ': 'L', 'Ｍ': 'M', 'Ｎ': 'N',
            'Ｏ': 'O', 'Ｐ': 'P', 'Ｑ': 'Q', 'Ｒ': 'R', 'Ｓ': 'S', 'Ｔ': 'T', 'Ｕ': 'U',
            'Ｖ': 'V', 'Ｗ': 'W', 'Ｘ': 'X', 'Ｙ': 'Y', 'Ｚ': 'Z',
            'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f', 'ｇ': 'g',
            'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j', 'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n',
            'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't', 'ｕ': 'u',
            'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y', 'ｚ': 'z',
        };
        let objs = {};
        Object.assign(objs, num);
        Object.assign(objs, kana);
        Object.assign(objs, alpha);
        let sql = columnNameOrValue;
        Object.keys(objs).forEach(key => sql = `TRANSLATE(${sql} ,'${key}','${objs[key]}')`);
        return sql;
    }
}
exports.default = WhereExpression;
