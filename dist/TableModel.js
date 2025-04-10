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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableModel = void 0;
const ValidateValueUtil_1 = __importDefault(require("./SqlUtils/ValidateValueUtil"));
const SelectExpression_1 = __importDefault(require("./SqlUtils/SelectExpression"));
const WhereExpression_1 = __importDefault(require("./SqlUtils/WhereExpression"));
class TableModel {
    get Columns() {
        if (Object.keys(this.columns).length === 0) {
            throw new Error("TableModelのcolumnsを設定してください。");
        }
        return this.columns;
    }
    getColumn(key) {
        if (key in this.Columns === false) {
            throw new Error(`${this.TableName}に${key}は存在しません。`);
        }
        return Object.assign(Object.assign({}, this.Columns[key]), { columnName: key, tableName: this.TableName, expression: `"${this.AsTableName}".${key}` });
    }
    get TableName() {
        if (this.tableName === "") {
            throw new Error("TableModelのtableNameを設定してください。");
        }
        return this.tableName;
    }
    get AsTableName() {
        return this.asTableName === "" ? this.TableName : this.asTableName;
    }
    get createSqlFromJoinWhere() {
        let sql = ` FROM ${this.TableName} as "${this.AsTableName}"`;
        for (const join of this.joinConditions) {
            sql += join.type === 'left' ? ' LEFT OUTER JOIN' : ' INNER JOIN';
            sql += ` ${join.model.TableName} as "${join.model.AsTableName}" ON `;
            const query = WhereExpression_1.default.createCondition(join.conditions, this, this.vars.length);
            sql += query.sql;
            if (query.vars !== undefined) {
                this.vars = [...this.vars, ...query.vars];
            }
        }
        if (this.whereExpressions.length > 0) {
            sql += " WHERE " + this.whereExpressions.join(" AND ");
        }
        if (this.groupExpression.length > 0) {
            sql += ` GROUP BY ${this.groupExpression.join(',')}`;
        }
        return sql;
    }
    get createSqlFromJoinWhereSortLimit() {
        let sql = this.createSqlFromJoinWhere;
        if (this.sortExpression.length > 0) {
            sql += ` ORDER BY ${this.sortExpression.join(",")}`;
        }
        if (this.Limit !== undefined) {
            sql += ` LIMIT ${this.Limit}`;
        }
        if (this.Offset !== undefined) {
            sql += ` OFFSET ${this.Offset}`;
        }
        return sql;
    }
    set OffsetPage(value) {
        if (value > 0) {
            this.Limit = this.pageCount;
            this.Offset = (value - 1) * this.pageCount;
        }
    }
    get PageCount() { return this.pageCount; }
    constructor(client, asName = "") {
        this.columns = {};
        this.tableName = "";
        this.asTableName = "";
        this.IsOutputLog = false;
        this.SortKeyword = 'asc';
        this.selectExpressions = [];
        this.joinConditions = [];
        this.whereExpressions = [];
        this.groupExpression = [];
        this.sortExpression = [];
        this.vars = [];
        // Setすることがあるなら、Setterを追加
        // その際にLimitとOffsetの更新も行う
        this.pageCount = 10;
        this.client = client;
        this.asTableName = asName;
    }
    throwValidationError(message) {
        throw new Error(message);
    }
    findId(id_1) {
        return __awaiter(this, arguments, void 0, function* (id, selectColumns = "*", selectExpressions = null) {
            ValidateValueUtil_1.default.validateId(this.Columns, id);
            let selects = [];
            if (selectColumns == "*") {
                for (const key of Object.keys(this.Columns)) {
                    selects.push(SelectExpression_1.default.create({ model: this, name: key }));
                }
            }
            else if (selectColumns != null) {
                for (const key of selectColumns) {
                    selects.push(SelectExpression_1.default.create({ model: this, name: key }));
                }
            }
            if (selectExpressions != null) {
                for (const expression of selectExpressions) {
                    selects.push(`${expression.expression} as "${expression.alias}"`);
                }
            }
            const sql = `SELECT ${selects.join(',')} FROM ${this.TableName} WHERE id = $1`;
            let datas = yield this.executeQuery(sql, [id]);
            return datas.rowCount == 0 ? null : datas.rows[0];
        });
    }
    select(param1 = "*", param2) {
        var _a, _b;
        if (param1 === "*") {
            const model = param2 instanceof TableModel ? param2 : this;
            for (const key of Object.keys(model.Columns)) {
                this.selectExpressions.push(SelectExpression_1.default.create({ model: model, name: key }));
            }
            return;
        }
        if (Array.isArray(param1)) {
            const model = param2 instanceof TableModel ? param2 : this;
            for (const key of param1) {
                if (typeof key === 'string') {
                    this.selectExpressions.push(SelectExpression_1.default.create({ model: model, name: key }));
                }
                else {
                    this.selectExpressions.push(SelectExpression_1.default.create({ model: model, name: key.name }, (_a = key.func) !== null && _a !== void 0 ? _a : null, (_b = key.alias) !== null && _b !== void 0 ? _b : ''));
                }
            }
            return;
        }
        if (typeof param1 === 'string') {
            const expression = param1;
            if (typeof param2 !== 'string' || param2.trim() === '') {
                throw new Error('第一引数が文字列の場合、第二引数は空文字以外の文字列を入力してください。');
            }
            const alias = param2;
            this.selectExpressions.push(`(${expression}) as "${alias}"`);
            return;
        }
    }
    /**
     * 指定された条件に基づいてテーブルを結合します。
     * @param joinType 結合の種類を指定します
     * @param joinBaseModel 結合する対象のBaseModelインスタンスを指定します。
     * @param conditions 結合条件を指定します。条件はオブジェクトまたは文字列で指定できます。
     */
    join(joinType, joinModel, conditions) {
        this.joinConditions.push({ type: joinType, model: joinModel, conditions: conditions });
    }
    where(left, operator, right) {
        if (typeof left === 'string') {
            if (operator === undefined || right === undefined) {
                this.whereExpressions.push(left);
            }
            else {
                const query = WhereExpression_1.default.create({ model: this, name: left }, operator, right, this.vars.length + 1);
                this.whereExpressions.push(query.sql);
                if (query.vars !== undefined) {
                    this.vars = [...this.vars, ...query.vars];
                }
            }
            return;
        }
        if ('model' in left && 'name' in left) {
            if (operator === undefined || right === undefined) {
                throw new Error(`leftがTColumnInfoの場合はoperator, rightを設定してください。`);
            }
            else {
                const query = WhereExpression_1.default.create(left, operator, right, this.vars.length + 1);
                this.whereExpressions.push(query.sql);
                if (query.vars !== undefined) {
                    this.vars = [...this.vars, ...query.vars];
                }
            }
            return;
        }
        if (Array.isArray(left)) {
            const query = WhereExpression_1.default.createCondition(left, this, this.vars.length + 1);
            this.whereExpressions.push(query.sql);
            if (query.vars !== undefined) {
                this.vars = [...this.vars, ...query.vars];
            }
        }
    }
    groupBy(column) {
        if (typeof column === 'string') {
            column = { model: this, name: column };
        }
        this.groupExpression.push(column.model.getColumn(column.name).expression);
    }
    orderBy(column, sortKeyword) {
        if (typeof column === 'string') {
            column = { model: this, name: column };
        }
        this.sortExpression.push(`${column.model.getColumn(column.name).expression} ${sortKeyword}`);
    }
    orderByList(column, list, sortKeyword) {
        if (list.length === 0) {
            return;
        }
        if (typeof (column) == 'string') {
            column = { model: this, name: column };
            ;
        }
        const columnInfo = column.model.getColumn(column.name);
        const orderConditions = [];
        for (let i = 0; i < list.length; i++) {
            const value = list[i];
            if (value === null) {
                if (columnInfo.attribute === 'nullable') {
                    orderConditions.push(`WHEN ${columnInfo.expression} is null THEN ${i}`);
                    continue;
                }
                throw new Error(`${this.TableName}.${columnInfo.columnName}はnull許容されていないカラムです。`);
            }
            ValidateValueUtil_1.default.validateValue(columnInfo, value);
            switch (columnInfo.type) {
                case 'number':
                    orderConditions.push(`WHEN ${columnInfo.expression} = ${value} THEN ${i}`);
                    break;
                case 'uuid':
                case 'string':
                    orderConditions.push(`WHEN ${columnInfo.expression} = '${value}' THEN ${i}`);
                    break;
                case 'bool':
                    const boolValue = value === true || value === 'true' || value === 1;
                    orderConditions.push(`WHEN ${columnInfo.expression} = ${boolValue} THEN ${i}`);
                    break;
            }
        }
        if (orderConditions.length === 0) {
            return;
        }
        this.sortExpression.push(`CASE ${orderConditions.join(' ')} ELSE ${list.length} END ${sortKeyword}`);
    }
    orderBySentence(query, sortKeyword) {
        this.sortExpression.push(`${query} ${sortKeyword}`);
    }
    executeSelect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.selectExpressions.length === 0) {
                this.select();
            }
            let sql = ` SELECT ${this.selectExpressions.join(",")} ${this.createSqlFromJoinWhereSortLimit}`;
            let data = yield this.executeQuery(sql, this.vars);
            return data.rows;
        });
    }
    executeSelectWithCount() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.selectExpressions.length == 0) {
                this.select();
            }
            let sql = ` SELECT ${this.selectExpressions.join(",")} ${this.createSqlFromJoinWhereSortLimit}`;
            let countSql = ` SELECT COUNT(*) as "count" ${this.createSqlFromJoinWhere}`;
            let tempVars = [...this.vars];
            const data = yield this.executeQuery(sql, tempVars);
            const countData = yield this.executeQuery(countSql, tempVars);
            return { datas: data.rows, count: Number(countData.rows[0].count), lastPage: Math.ceil(Number(countData.rows[0].count) / this.pageCount) };
        });
    }
    validateOptions(options, isInsert) {
        var _a;
        if (Object.keys(options).length === 0) {
            throw new Error('optionsは最低1つ以上のkey-valueが必要です。');
        }
        for (const [key, value] of Object.entries(options)) {
            const column = this.getColumn(key);
            if (isInsert === false && column.attribute === 'primary') {
                throw new Error(`${this.TableName}.${key}はprimary keyのため、変更できません。`);
            }
            if (value === null) {
                if (column.attribute === 'nullable') {
                    continue;
                }
                this.throwValidationError(`${this.tableName}.${key}はNULL許容されていないカラムです。`);
            }
            const name = ((_a = column.alias) !== null && _a !== void 0 ? _a : '') === '' ? key : column.alias;
            if (ValidateValueUtil_1.default.isErrorValue(column.type, value)) {
                switch (column.type) {
                    case "string":
                        this.throwValidationError(`${name}はstringまたはnumber型で入力してください`);
                    case 'uuid':
                        this.throwValidationError(`${name}はUUIDで入力してください。`);
                    case 'number':
                        this.throwValidationError(`${name}は数値で入力してください。`);
                    case 'bool':
                        this.throwValidationError(`${name}はbool型,"true","false",0,1のいずれかで入力してください。`);
                    case 'date':
                        this.throwValidationError(`${name}は"YYYY-MM-DD" or "YYYY-MM-DD hh:mi:ss"形式 or Date型で入力してください。`);
                    case 'time':
                        this.throwValidationError(`${name}は"hh:mi"形式または"hh:mi:ss"形式で入力してください。`);
                    case 'timestamp':
                        this.throwValidationError(`${name}は"YYYY-MM-DD"形式または"YYYY-MM-DD hh:mi:ss"形式または"YYYY-MM-DDThh:mi:ss"形式またはDate型で入力してください。`);
                }
            }
            if (column.type === 'string') {
                if (column.length === undefined) {
                    throw new Error("stringの場合、columnのlengthを指定してください。");
                }
                if (value.toString().length > column.length) {
                    this.throwValidationError(`${name}は${column.length}文字以内で入力してください。`);
                }
            }
        }
    }
    validateInsert(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            for (const key in this.Columns) {
                const column = this.getColumn(key);
                const name = ((_a = column.alias) !== null && _a !== void 0 ? _a : '') === '' ? key : column.alias;
                if (options[key] === undefined || options[key] === null) {
                    // Null許容されていないカラムにNULLを入れようとしているか？
                    if (column.attribute === "primary" || column.attribute === "noDefault") {
                        this.throwValidationError(`${name}を入力してください。`);
                    }
                }
            }
        });
    }
    validateUpdate(options) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    validateUpdateId(id, options) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    validateDelete() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    validateDeleteId(id) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    executeInsert(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateOptions(options, true);
            yield this.validateInsert(options);
            const columns = [];
            const vars = [];
            for (const [key, value] of Object.entries(options)) {
                if (value === undefined) {
                    throw new Error(`insert optionの${key}がundefinedになっています。`);
                }
                columns.push(key);
                vars.push(value);
            }
            const params = vars.map((_, index) => `$${index + 1}`);
            const sql = `INSERT INTO ${this.TableName} (${columns.join(",")}) VALUES (${params.join(",")});`;
            yield this.executeQuery(sql, vars);
        });
    }
    executeUpdate(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateOptions(options, false);
            yield this.validateUpdate(options);
            const updateExpressions = [];
            for (const [key, value] of Object.entries(options)) {
                const column = this.getColumn(key);
                ValidateValueUtil_1.default.validateValue(column, value);
                this.vars.push(value);
                updateExpressions.push(`${key} = $${this.vars.length}`);
            }
            let sql = `UPDATE ${this.TableName} "${this.AsTableName}" SET ${updateExpressions.join(',')} `;
            if (this.joinConditions.length > 0) {
                const tables = [];
                for (const join of this.joinConditions) {
                    tables.push(`${join.model.TableName} as "${join.model.AsTableName}"`);
                    const query = WhereExpression_1.default.createCondition(join.conditions, this, this.vars.length);
                    this.whereExpressions.push(query.sql);
                    if (query.vars !== undefined) {
                        this.vars = [...this.vars, ...query.vars];
                    }
                }
                sql += `FROM ${tables.join(',')} `;
            }
            if (this.whereExpressions.length > 0) {
                sql += "WHERE " + this.whereExpressions.join(" AND ");
            }
            const data = yield this.executeQuery(sql, this.vars);
            return data.rowCount;
        });
    }
    executeUpdateId(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            ValidateValueUtil_1.default.validateId(this.Columns, id);
            this.validateOptions(options, false);
            yield this.validateUpdateId(id, options);
            yield this.validateUpdate(options);
            const updateExpressions = [];
            const vars = [];
            for (const [key, value] of Object.entries(options)) {
                if (value === undefined) {
                    throw new Error(`update optionの${key}がundefinedになっています。`);
                }
                const column = this.getColumn(key);
                if (column.attribute === 'primary') {
                    throw new Error(`primary keyである${this.TableName}.${key}は変更できません。`);
                }
                vars.push(value);
                updateExpressions.push(`${key} = $${vars.length}`);
            }
            vars.push(id);
            const sql = `UPDATE ${this.TableName} SET ${updateExpressions.join(',')} WHERE id = $${vars.length}`;
            const data = yield this.executeQuery(sql, vars);
            return data.rowCount == 1;
        });
    }
    executeDelete() {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateDelete();
            let sql = `DELETE FROM ${this.TableName} "${this.AsTableName}" `;
            if (this.joinConditions.length > 0) {
                const tables = [];
                for (const join of this.joinConditions) {
                    tables.push(`${join.model.TableName} as "${join.model.AsTableName}"`);
                    const query = WhereExpression_1.default.createCondition(join.conditions, this, this.vars.length);
                    this.whereExpressions.push(query.sql);
                    if (query.vars !== undefined) {
                        this.vars = [...this.vars, ...query.vars];
                    }
                    sql += ` USING ${tables.join(',')} `;
                }
            }
            if (this.whereExpressions.length > 0) {
                sql += "WHERE " + this.whereExpressions.join(" AND ");
            }
            const datas = yield this.executeQuery(sql, this.vars);
            return datas.rowCount;
        });
    }
    executeDeleteId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            ValidateValueUtil_1.default.validateId(this.Columns, id);
            yield this.validateDeleteId(id);
            let sql = `DELETE FROM ${this.TableName} WHERE id = $1`;
            const datas = yield this.executeQuery(sql, [id]);
            return datas.rowCount == 1;
        });
    }
    executeQuery(param1, vars) {
        return __awaiter(this, void 0, void 0, function* () {
            // 初期化項目
            this.selectExpressions = [];
            this.whereExpressions = [];
            this.joinConditions = [];
            this.sortExpression = [];
            this.SortKeyword = 'asc';
            this.groupExpression = [];
            this.vars = [];
            this.Offset = undefined;
            this.Limit = undefined;
            let sql = '';
            if (typeof param1 === 'string') {
                sql = param1;
            }
            else {
                sql = param1.sql;
                vars = param1.vars;
            }
            if (this.IsOutputLog) {
                console.log("--- Debug Sql ----------");
                console.log(sql);
                console.log(vars);
            }
            const data = yield this.client.query(sql, vars !== null && vars !== void 0 ? vars : []);
            if (this.IsOutputLog) {
                console.log("- 実行結果");
                if (data.rowCount == 0) {
                    console.log("データなし");
                }
                else {
                    let log = "";
                    for (let i = 0; i < data.fields.length; i++) {
                        log += i == 0 ? "" : ",";
                        log += data.fields[i].name;
                    }
                    console.log(log);
                    for (let i = 0; i < data.rows.length; i++) {
                        log = "";
                        for (let j = 0; j < data.fields.length; j++) {
                            let key = data.fields[j].name;
                            log += j == 0 ? "" : ",";
                            log += data.rows[i][key];
                        }
                        console.log(log);
                    }
                }
            }
            return data;
        });
    }
}
exports.TableModel = TableModel;
