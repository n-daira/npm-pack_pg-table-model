import { PoolClient } from 'pg';
import { TAggregateFuncType, TColumn, TColumnAttribute, TColumnInfo, TColumnType, TKeyFormat, TNestedCondition, TOperator, TQuery, TSelectExpression, TSortKeyword, TSqlValue } from "./Type";
import ValidateValueUtil from './SqlUtils/ValidateValueUtil';
import SelectExpression from './SqlUtils/SelectExpression';
import WhereExpression from './SqlUtils/WhereExpression';

export class TableModel {

    protected readonly dbName: string = "default";
    get DbName(): string { return this.dbName; }
    protected readonly tableName: string = "";
    get TableName(): string { 
        if (this.tableName === "") {
            throw new Error("Please set the tableName for TableModel.");
        }
        return this.tableName;
    }
    protected readonly tableDescription: string = "";
    get TableDescription(): string { return this.tableDescription; }
    protected readonly comment: string = "";
    get Comment(): string { return this.comment; }
    protected readonly columns: { [key: string]: TColumn } = {};
    get Columns(): { [key: string]: TColumn } { 
        if (Object.keys(this.columns).length === 0) {
            throw new Error("Please set the columns for TableModel.");
        }
        return this.columns; 
    }
    public getColumn(key: string) {
        if (key in this.Columns === false) {
            throw new Error(`${this.TableName} does not contain ${key}.`);
        }

        return { 
            ...this.Columns[key],
            columnName: key,
            tableName: this.TableName,
            expression: `"${this.TableAlias}".${key}`
        };
    }
    protected readonly references: Array<{table: string, columns: Array<{target: string, ref: string}>}> = [];
    get References(): Array<{table: string, columns: Array<{target: string, ref: string}>}> { return this.references; }
    public GetReferences(columnName: string): Array<{table: string, columns: Array<{target: string, ref: string}>}> {
        const _ = this.getColumn(columnName); // 存在チェック用
        const references: Array<{table: string, columns: Array<{target: string, ref: string}>}> = [];
        for (const ref of this.References) {
            if (ref.columns.filter(col => col.target === columnName).length > 0) {
                references.push(ref);
            }
        }

        return references;
    }

    protected readonly tableAlias?: string;
    get TableAlias(): string {
        return this.tableAlias === undefined ? this.TableName : this.tableAlias;
    }

    public IsOutputLog: boolean = false;
    public SortKeyword: TSortKeyword = 'asc';
    public Offset?: number;
    public Limit?: number;
    public PageCount: number = 10;

    private selectExpressions: Array<string> = [];
    private joinConditions: Array<{
        type: 'inner' | 'left',
        model: TableModel,
        conditions: Array<TNestedCondition>
    }> = [];
    private whereExpressions: Array<string> = [];
    private groupExpression: Array<string> = [];
    private sortExpression: Array<string> = [];
    private vars: Array<any> = [];

    private get createSqlFromJoinWhere(): string {
        let sql = ` FROM ${this.TableName} as "${this.TableAlias}"`;

        for (const join of this.joinConditions) {
            sql += join.type === 'left' ? ' LEFT OUTER JOIN' : ' INNER JOIN';
            sql += ` ${join.model.TableName} as "${join.model.TableAlias}" ON `;
            const query = WhereExpression.createCondition(join.conditions, this, this.vars.length + 1);
            sql += query.sql;
            if (query.vars !== undefined) {
                this.vars = [...this.vars, ...query.vars]
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
    private get createSqlFromJoinWhereSortLimit(): string {
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
    set OffsetPage(value: number) {
        if (value > 0) {
            this.Limit = this.PageCount;
            this.Offset = (value - 1) * this.PageCount;
        }
    }

    private client: PoolClient;
    constructor(client: PoolClient);
    constructor(client: PoolClient, tableAlias: string);
    constructor(client: PoolClient, tableAlias?: string) {
        this.client = client;
        if (tableAlias !== undefined && tableAlias.trim() !== '') {
            this.tableAlias = tableAlias;
        }
    }

    public findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null, selectExpressions: Array<TSelectExpression> | null, keyFormat: TKeyFormat): Promise<T | null>;
    public findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null, selectExpressions: Array<TSelectExpression> | null): Promise<T | null>;
    public findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null): Promise<T | null>;
    public findId<T = {[key: string]: any}>(id: any): Promise<T | null>;
    public async findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null = "*", selectExpressions: Array<TSelectExpression> | null = null, keyFormat: TKeyFormat = 'snake'): Promise<T | null> {
        ValidateValueUtil.validateId(this.Columns, id);

        let selects: Array<string> = [];
        if (selectColumns == "*") {
            for (const key of Object.keys(this.Columns)) {
                selects.push(SelectExpression.create({model: this, name: key}, null, null, keyFormat));
            }
        } else if (selectColumns != null) {
            for (const key of selectColumns) {
                selects.push(SelectExpression.create({model: this, name: key}, null, null, keyFormat));
            }
        }

        if (selectExpressions != null) {
            for (const expression of selectExpressions) {
                selects.push(`${expression.expression} as "${expression.alias}"`);
            }
        }

        const sql = `SELECT ${selects.join(',')} FROM ${this.TableName} WHERE id = $1`;
        let datas = await this.executeQuery(sql, [id]);

        return datas.rowCount == 0 ? null : datas.rows[0] as T;
    }

    public find<T = {[key: string]: any}>(pk: {[key: string]: any}, selectColumns: Array<string> | "*" | null, selectExpressions: Array<TSelectExpression> | null, keyFormat: TKeyFormat): Promise<T | null>;
    public find<T = {[key: string]: any}>(pk: {[key: string]: any}, selectColumns: Array<string> | "*" | null, selectExpressions: Array<TSelectExpression> | null): Promise<T | null>;
    public find<T = {[key: string]: any}>(pk: {[key: string]: any}, selectColumns: Array<string> | "*" | null): Promise<T | null>;
    public find<T = {[key: string]: any}>(pk: {[key: string]: any}): Promise<T | null>;
    public async find<T = {[key: string]: any}>(pk: {[key: string]: any}, selectColumns: Array<string> | "*" | null = "*", selectExpressions: Array<TSelectExpression> | null = null, keyFormat: TKeyFormat = 'snake'): Promise<T | null> {

        let selects: Array<string> = [];
        if (selectColumns == "*") {
            for (const key of Object.keys(this.Columns)) {
                selects.push(SelectExpression.create({model: this, name: key}, null, null, keyFormat));
            }
        } else if (selectColumns != null) {
            for (const key of selectColumns) {
                selects.push(SelectExpression.create({model: this, name: key}, null, null, keyFormat));
            }
        }

        if (selectExpressions != null) {
            for (const expression of selectExpressions) {
                selects.push(`${expression.expression} as "${expression.alias}"`);
            }
        }

        const conditions = [];
        const vars = [];
        for (const [keyColumn, column] of Object.entries(this.Columns)) {
            if (column.attribute !== 'primary') {
                continue;
            }

            if (pk[keyColumn] === undefined || pk[keyColumn] === null) {
                throw new Error(`No value is set for the primary key "${this.TableName}".${keyColumn}. Please set it in the first argument.`);
            }
            ValidateValueUtil.validateValue(column, pk[keyColumn]);
            vars.push(pk[keyColumn]);
            conditions.push(`${keyColumn} = $${vars.length}`);
        }
 
        const sql = `SELECT ${selects.join(',')} FROM ${this.TableName} WHERE ${conditions.join(' AND ')}`;
        let datas = await this.executeQuery(sql, vars);

        return datas.rowCount == 0 ? null : datas.rows[0] as T;
    }

    public select(): void;
    public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*'): void;
    public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*', model: TableModel): void;
    public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*', keyFormat: TKeyFormat): void;
    public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*', model: TableModel, keyFormat: TKeyFormat): void;
    public select(expression: string, alias: string): void;
    public select(param1: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | "*" | string = "*", param2?: TableModel | string | TKeyFormat, param3?: TKeyFormat) {
        if (param1 === "*") {
            let model: TableModel = this;
            let keyFormat: TKeyFormat = 'snake';
            if (param2 instanceof TableModel) {
                model = param2;
                if (param3 === 'snake' || param3 === 'lowerCamel') {
                    keyFormat = param3;
                }
            } else if (param2 === 'snake' || param2 === 'lowerCamel') {
                keyFormat = param2;
            }

            for (const key of Object.keys(model.Columns)) {
                this.selectExpressions.push(SelectExpression.create({model: model, name: key}, null, null, keyFormat));
            }
            return;
        }

        if (Array.isArray(param1)) {
            let model: TableModel = this;
            let keyFormat: TKeyFormat = 'snake';
            if (param2 instanceof TableModel) {
                model = param2;
                if (param3 === 'snake' || param3 === 'lowerCamel') {
                    keyFormat = param3;
                }
            } else if (param2 === 'snake' || param2 === 'lowerCamel') {
                keyFormat = param2;
            }

            for (const key of param1) {
                if (typeof key === 'string') {
                    this.selectExpressions.push(SelectExpression.create({model: model, name: key}, null, null, keyFormat));
                } else {
                    this.selectExpressions.push(SelectExpression.create({model: model, name: key.name}, key.func ?? null, key.alias ?? null, keyFormat));
                }
            }
            return;
        }

        if (typeof param1 === 'string') {
            const expression = param1;
            if (typeof param2 !== 'string' || param2.trim() === '') {
                throw new Error('If the first argument is a string, the second argument must be a non-empty string.');
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
    public join(joinType: 'left' | 'inner', joinModel: TableModel, conditions: Array<TNestedCondition>): void {
        this.joinConditions.push({type: joinType, model: joinModel, conditions: conditions});
    }

    public where(expression: string): void;
    public where(conditions: Array<TNestedCondition>): void;
    public where(left: string, operator: TOperator, right: TSqlValue | Array<TSqlValue> | TColumnInfo | null): void;
    public where(left: TColumnInfo, operator: TOperator, right: TSqlValue | Array<TSqlValue> | TColumnInfo | null): void;
    public where(left: string | TColumnInfo | Array<TNestedCondition>, operator?: TOperator, right?: TSqlValue | Array<TSqlValue> | TColumnInfo | null): void {
        if (typeof left === 'string') {
            if (operator === undefined || right === undefined) {
                this.whereExpressions.push(left);
            } else {
                const query = WhereExpression.create({model: this, name: left}, operator, right, this.vars.length + 1);
                this.whereExpressions.push(query.sql);
                if (query.vars !== undefined) {
                    this.vars = [...this.vars, ...query.vars];
                }
            }
            return;
        }

        if ('model' in left && 'name' in left) {
            if (operator === undefined || right === undefined) {
                throw new Error(`If left is TColumnInfo, please set operator and right.`);
            } else {
                const query = WhereExpression.create(left, operator, right, this.vars.length + 1);
                this.whereExpressions.push(query.sql);
                if (query.vars !== undefined) {
                    this.vars = [...this.vars, ...query.vars];
                }
            }
            return;
        }

        if (Array.isArray(left)) {
            const query = WhereExpression.createCondition(left, this, this.vars.length + 1);
            this.whereExpressions.push(query.sql);
            if (query.vars !== undefined) {
                this.vars = [...this.vars, ...query.vars];
            }
        }
    }

    public groupBy(column: string | TColumnInfo): void {
        if (typeof column === 'string') {
            column = {model: this, name: column};
        }
        this.groupExpression.push(column.model.getColumn(column.name).expression);
    }

    public orderBy(column: string | TColumnInfo, sortKeyword: TSortKeyword) {
        if (typeof column === 'string') {
            column = { model: this, name: column };
        }
        this.sortExpression.push(`${column.model.getColumn(column.name).expression} ${sortKeyword}`);
    }

    public orderByList(column: string | TColumnInfo, list: Array<string | number | boolean | null>, sortKeyword: TSortKeyword): void {
        if (list.length === 0) {
            return;
        }

        if (typeof(column) == 'string') {
            column = {model: this, name: column};;
        }
        const columnInfo = column.model.getColumn(column.name);

        const orderConditions: Array<string> = [];
        for (let i = 0;i < list.length;i++) {
            const value = list[i];
            if (value === null) {
                if (columnInfo.attribute === 'nullable') {
                    orderConditions.push(`WHEN ${columnInfo.expression} is null THEN ${i}`);
                    continue;
                }
                throw new Error(`${this.TableName}.${columnInfo.columnName} is a non-nullable column.`);
            }

            ValidateValueUtil.validateValue(columnInfo, value);
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

    public orderBySentence(query: string, sortKeyword: TSortKeyword): void {
        this.sortExpression.push(`${query} ${sortKeyword}`);
    }

    public async executeSelect<T = {[key: string]: any}>(): Promise<Array<T>> {
        if (this.selectExpressions.length === 0) {
            this.select();
        }

        let sql = ` SELECT ${this.selectExpressions.join(",")} ${this.createSqlFromJoinWhereSortLimit}`;
        let data = await this.executeQuery(sql, this.vars);
        return data.rows as Array<T>;
    }

    public async executeSelectWithCount<T = any>(): Promise<{ datas: Array<T>, count: number, lastPage: number}> {
        if (this.selectExpressions.length == 0) {
            this.select();
        }

        let sql = ` SELECT ${this.selectExpressions.join(",")} ${this.createSqlFromJoinWhereSortLimit}`;
        let countSql = ` SELECT COUNT(*) as "count" ${this.createSqlFromJoinWhere}`;
        let tempVars = [...this.vars];
        const data = await this.executeQuery(sql, tempVars);

        const countData = await this.executeQuery(countSql, tempVars);
        return { datas: data.rows as Array<T>, count: Number(countData.rows[0].count), lastPage: Math.ceil(Number(countData.rows[0].count) / this.PageCount)};
    }

    protected readonly errorMessages: Record<TColumnType | 'length' | 'null' | 'notInput' | 'fk', string> = {
        'string': '{name} should be entered as a string or number type.',
        'uuid': '{name} should be entered as a UUID.',
        'number': '{name} should be entered as a number.',
        'bool': '{name} should be entered as a bool type, "true", "false", 0, or 1.',
        'date': '{name} should be entered in "YYYY-MM-DD" or "YYYY-MM-DD hh:mi:ss" format or as a Date type.',
        'time': '{name} should be entered in "hh:mi" format or "hh:mi:ss" format.',
        'timestamp': '{name} should be entered in "YYYY-MM-DD" format, "YYYY-MM-DD hh:mi:ss" format, "YYYY-MM-DDThh:mi:ss" format, or as a Date type.',
        'length': '{name} should be entered within {length} characters.',
        'null': '{name} is not allowed to be null.',
        'notInput': 'Please enter {name}.',
        'fk': 'The value of {name} does not exist in "{table}".{column}.'
    }
    protected throwValidationError(code: string, message: string): never {
        throw new Error(message);
    }

    protected async validateOptions(options: {[key: string]: TSqlValue}, isInsert: boolean): Promise<void> {
        if (Object.keys(options).length === 0) {
            throw new Error('At least one key-value pair is required in options.');
        }

        for (const [key, value] of Object.entries(options)) {
            const column = this.getColumn(key);
            if (isInsert === false && column.attribute === 'primary') {
                throw new Error(`${this.TableName}.${key} cannot be modified because it is a primary key.`);
            }

            const name = (column.alias === undefined || column.alias === '') ? key : column.alias;
            if (value === null) {
                if (column.attribute === 'nullable') {
                    continue;
                }
                this.throwValidationError("001", this.errorMessages.null.replace('{name}', name));
            }

            if (ValidateValueUtil.isErrorValue(column.type, value)) {
                this.throwValidationError("002", this.errorMessages[column.type].replace('{name}', name));
            }

            if (column.type === 'string') {
                if (column.length === undefined) {
                    throw new Error("For strings, please specify the length of the column.");
                }

                if (value.toString().length > column.length) {
                    this.throwValidationError("003", this.errorMessages.length.replace('{name}', name).replace('{length}', column.length.toString()));
                }
            }
        }

        // 外部キー制約チェック
        if (isInsert) {
            for (const ref of this.References) {
                let refIndex = 1;
                const sql = `SELECT COUNT(*) as count FROM ${ref.table} WHERE ${ref.columns.map(col => `${col.ref} = $${refIndex++}`)}`;
                if (this.IsOutputLog) {
                    console.log("SQL : Verify foreign key");
                    console.log(sql);
                }
                const datas = await this.client.query(sql, ref.columns.map(col => options[col.target]));
                if (datas.rows[0].count === 0) {
                    this.throwValidationError("004", this.errorMessages.fk.replace(
                        '{name}', 
                        ref.columns.map(col => this.getColumn(col.target)).join(',')).replace('{table}', ref.table).replace('{column}', ref.columns.map(col => col.ref).join(',')));
                }
            }
        }
    }

    protected async validateInsert(options: {[key: string]: TSqlValue}) : Promise<void> {
        for (const key in this.Columns) {
            const column = this.getColumn(key);
            const name = (column.alias === undefined || column.alias === '') ? key : column.alias;
            if (options[key] === undefined || options[key] === null) {
                // Null許容されていないカラムにNULLを入れようとしているか？
                if (column.attribute === "primary" || column.attribute === "noDefault") {
                    this.throwValidationError("101", this.errorMessages.notInput.replace('{name}', name));
                }
            }
        }
    }

    protected async validateUpdate(options: {[key: string]: TSqlValue}) : Promise<void> { }
    protected async validateUpdateId(id: any, options: {[key: string]: TSqlValue}) : Promise<void> { }
    protected async validateDelete() : Promise<void> { }
    protected async validateDeleteId(id: any) : Promise<void> { }

    public async executeInsert(options: {[key: string]: TSqlValue}) : Promise<void> {
        await this.validateOptions(options, true);
        await this.validateInsert(options);

        const columns: Array<string> = [];
        const vars: Array<any> = [];

        for (const [key, value] of Object.entries(options)) {
            if (value === undefined) {
                throw new Error(`The insert option ${key} is undefined.`);
            }

            columns.push(key);
            vars.push(value)
        }

        const params = vars.map((_, index) => `$${index + 1}`);
        const sql = `INSERT INTO ${this.TableName} (${columns.join(",")}) VALUES (${params.join(",")});`;
        await this.executeQuery(sql, vars);
    }

    public async executeUpdate(options: {[key: string]: TSqlValue}) : Promise<number> {
        await this.validateOptions(options, false);
        await this.validateUpdate(options);

        const updateExpressions: Array<string> = [];
        for (const [key, value] of Object.entries(options)) {
            const column = this.getColumn(key);
            ValidateValueUtil.validateValue(column, value);
            this.vars.push(value);
            updateExpressions.push(`${key} = $${this.vars.length}`)
        }

        let sql = `UPDATE ${this.TableName} "${this.TableAlias}" SET ${updateExpressions.join(',')} `;

        if (this.joinConditions.length > 0) {
            const tables: Array<string> = [];
            for (const join of this.joinConditions) {
                tables.push(`${join.model.TableName} as "${join.model.TableAlias}"`);

                const query = WhereExpression.createCondition(join.conditions, this, this.vars.length);
                this.whereExpressions.push(query.sql);
                if (query.vars !== undefined) {
                    this.vars = [...this.vars, ...query.vars]
                }
            }
            sql += `FROM ${tables.join(',')} `;
        }

        if (this.whereExpressions.length > 0) {
            sql += "WHERE " + this.whereExpressions.join(" AND ");
        }

        const data = await this.executeQuery(sql, this.vars);
        return data.rowCount;
    }

    public async executeUpdateId(id: any, options: {[key: string]: TSqlValue}) : Promise<boolean> {
        ValidateValueUtil.validateId(this.Columns, id);
        await this.validateOptions(options, false);
        await this.validateUpdateId(id, options);
        await this.validateUpdate(options);

        const updateExpressions: Array<string> = [];
        const vars: Array<any> = [];

        for (const [key, value] of Object.entries(options)) {
            if (value === undefined) {
                throw new Error(`The update option ${key} is undefined.`);
            }

            const column = this.getColumn(key);
            if (column.attribute === 'primary') {
                throw new Error(`The primary key ${this.TableName}.${key} cannot be changed.`);
            }

            vars.push(value);
            updateExpressions.push(`${key} = $${vars.length}`);
        }
        vars.push(id);
        
        const sql = `UPDATE ${this.TableName} SET ${updateExpressions.join(',')} WHERE id = $${vars.length}`;
        const data = await this.executeQuery(sql, vars);
        return data.rowCount == 1;
    }

    public async executeDelete() : Promise<number> {
        this.validateDelete();
        let sql = `DELETE FROM ${this.TableName} "${this.TableAlias}" `;

        if (this.joinConditions.length > 0) {
            const tables: Array<string> = [];
            for (const join of this.joinConditions) {
                tables.push(`${join.model.TableName} as "${join.model.TableAlias}"`);

                const query = WhereExpression.createCondition(join.conditions, this, this.vars.length);
                this.whereExpressions.push(query.sql);
                if (query.vars !== undefined) {
                    this.vars = [...this.vars, ...query.vars]
                }
                sql += ` USING ${tables.join(',')} `;
            }
        }

        if (this.whereExpressions.length > 0) {
            sql += "WHERE " + this.whereExpressions.join(" AND ");
        }

        const datas = await this.executeQuery(sql, this.vars);
        return datas.rowCount;
    }

    public async executeDeleteId(id: any) : Promise<boolean> {
        ValidateValueUtil.validateId(this.Columns, id);
        await this.validateDeleteId(id);
        let sql = `DELETE FROM ${this.TableName} WHERE id = $1`;

        const datas = await this.executeQuery(sql, [id]);
        return datas.rowCount == 1;
    }

    protected executeQuery(param1: string, vars?: Array<any>) : Promise<any>;
    protected executeQuery(param1: TQuery) : Promise<any>;
    protected async executeQuery(param1: string | TQuery, vars?: Array<any>) : Promise<any> {

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
        this.PageCount = 10;

        let sql = '';
        if (typeof param1 === 'string') {
            sql = param1;
        } else {
            sql = param1.sql;
            vars = param1.vars;
        }

        if (this.IsOutputLog) {
            console.log("--- Debug Sql ----------");
            console.log(sql);
            console.log(vars);
        }

        const data = await this.client.query(sql, vars ?? []);

        if (this.IsOutputLog) {
            console.log("- 実行結果");
            if (data.rowCount == 0) {
                console.log("データなし");
            } else {
                let log = "";
                for (let i = 0;i < data.fields.length;i++) {
                    log += i == 0 ? "" : ",";
                    log += data.fields[i].name;
                }
                console.log(log);
        
                for (let i = 0;i < data.rows.length;i++) {
                    log = "";
                    for (let j = 0;j < data.fields.length;j++) {
                        let key = data.fields[j].name;
                        log += j == 0 ? "" : ",";
                        log += data.rows[i][key];
                    }
                    console.log(log);
                }
            }
        }


        return data;
    }
}