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
const QueryUtil_1 = __importDefault(require("./SqlUtils/QueryUtil"));
const WhereExpression_1 = __importDefault(require("./SqlUtils/WhereExpression"));
const SqlUtils_1 = __importDefault(require("./SqlUtils/SqlUtils"));
class TableModel {
    get Columns() {
        if (Object.keys(this.columns).length === 0) {
            throw new Error("TableModelのcolumnsを設定してください。");
        }
        return this.columns;
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
        if (this.joinConditions.length > 0) {
            this.joinConditions.forEach((joinCondition) => {
                sql += {
                    'left': " LEFT OUTER JOIN ",
                    'inner': " INNER JOIN "
                }[joinCondition.type];
                sql += `${joinCondition.joinBaseModel.TableName} as "${joinCondition.joinBaseModel.AsTableName}" ON `;
                sql += joinCondition.conditions.join(" AND ");
            });
        }
        if (this.whereExpressions.length > 0) {
            sql += " WHERE " + this.whereExpressions.join(" AND ");
        }
        return sql;
    }
    get createSqlFromJoinWhereSortLimit() {
        let sql = this.createSqlFromJoinWhere;
        this.orderBy("id", this.IsDescIdSort);
        sql += ` ORDER BY ${this.sortConditions.join(",")}`;
        if (this.Limit !== undefined && this.Limit !== null) {
            sql += ` LIMIT ${this.Limit}`;
        }
        if (this.Offset !== undefined && this.Offset !== null) {
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
        this.selectExpressions = [];
        this.whereExpressions = [];
        this.vars = [];
        this.joinConditions = [];
        this.sortConditions = [];
        this.IsDescIdSort = true;
        this.Offset = null;
        this.Limit = null;
        // Setすることがあるなら、Setterを追加
        // その際にLimitとOffsetの更新も行う
        this.pageCount = 10;
        this.client = client;
        this.asTableName = asName;
    }
    /**
     * SELECT句の追加
     * @param selectColumns 取得するカラム名の配列。デフォルトは全カラム（"*"）。
     * @param tableInfo テーブル情報のオブジェクト。デフォルトは現在のテーブル情報。
     */
    select(columns = "*", model) {
        if (model === undefined) {
            model = this;
        }
        if (columns == "*") {
            for (const key of Object.keys(this.Columns)) {
                this.selectExpressions.push(SelectExpression_1.default.create({ model: model, name: key }));
            }
        }
        else if (columns != null) {
            for (const key of columns) {
                this.selectExpressions.push(SelectExpression_1.default.create({ model: model, name: key }));
            }
        }
    }
    /**
     * WHERE条件の追加
     * @param leftColumnOrQuery 左辺のカラム名またはColumnInfoTypeオブジェクト または 条件クエリ式
     * @param operator 演算子（例: '=', '>', '<'など）
     * @param rightColumn 右辺の値またはColumnInfoTypeオブジェクト
     */
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
        }
        else {
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
        }
    }
    // /**
    //  * 日付を比較するWHERE条件を追加します。
    //  * @param leftColumnOrQuery 左辺のカラム名またはColumnInfoTypeオブジェクト
    //  * @param operator 演算子（例: '=', '>', '<'など）
    //  * @param date 比較する日付の形式（"DATE" または "TIMESTAMP"）
    //  */
    // public whereCompareDate(leftColumnOrQuery: string | ColumnInfoType, operator: OperatorParamType, date: "DATE" | "TIMESTAMP") {
    //     const column = typeof leftColumnOrQuery == 'string' ? new ColumnInfoType(leftColumnOrQuery, this) : leftColumnOrQuery;
    //     this.whereConditions.push(SqlUtil.createWhereCompareDate(column, operator, date));
    // }
    // /**
    //  * 今日の日付を基準にタイムスタンプを比較するWHERE条件を追加します。
    //  * @param leftColumnOrQuery 左辺のカラム名またはColumnInfoTypeオブジェクト
    //  */
    // public whereTimestampToDate(leftColumnOrQuery: string | ColumnInfoType, date: string | Date = new Date()) {
    //     const column = typeof leftColumnOrQuery == 'string' ? new ColumnInfoType(leftColumnOrQuery, this) : leftColumnOrQuery;
    //     this.whereConditions.push(`DATE(${column.ColumnQuery}) = ${this.toSqlValueDate(date)}`);
    // }
    // /**
    //  * 複数の条件をANDまたはORで結合してWHERE句に追加します。
    //  * @param conditions 条件の配列。各条件はNestedConditionTypeとして指定します。
    //  */
    // public whereOrAnd(conditions: Array<TNestedCondition>) {
    //     this.whereConditions.push(this.createCondition(conditions, this));
    // }
    // /**
    //  * 【廃止予定】
    //  * OR条件をWHERE句に追加します。
    //  * @param conditions OR条件を構成する条件の配列
    //  */
    // public whereOr(conditions: Array<NestedWhereCondition>) {
    //     this.whereConditions.push(this.createWhereOr(['OR', ...conditions]));
    // }
    // /**
    //  * 【廃止予定】
    //  * OR条件を作成するためのヘルパーメソッド
    //  * @param conditions OR条件を構成する条件の配列
    //  * @returns OR条件を表すSQLクエリ文字列
    //  */
    // private createWhereOr(conditions: Array<NestedWhereCondition>): string {
    //     if (conditions.length < 2) {
    //         return '';
    //     }
    //     const operator = conditions.shift();
    //     let queryConditions: string[] = [];
    //     for (let condition of conditions) {
    //         if (Array.isArray(condition)) {
    //             queryConditions.push(this.createWhereOr(condition))
    //         } else if (typeof condition === 'string') {
    //             queryConditions.push(condition);
    //         } else {
    //             if (typeof condition.leftColumn === 'string') {
    //                 queryConditions.push(SqlUtil.createWhere(
    //                     new ColumnInfoType(condition.leftColumn, this),
    //                     condition.operator,
    //                     condition.rightColumn
    //                 ));
    //             } else {
    //                 queryConditions.push(SqlUtil.createWhere(
    //                     condition.leftColumn,
    //                     condition.operator,
    //                     condition.rightColumn
    //                 ));
    //             }
    //         }
    //     }
    //     return `(${queryConditions.filter(condition => condition !== null && condition !== '').join(` ${operator} `)})`;
    // }
    /**
     * ソート条件を追加します
     * @param column カラム名またはColumnInfoTypeオブジェクト
     * @param isDesc true: 降順ソート、false: 昇順ソート、null: 昇順ソート
     */
    orderBy(column, isDesc = null) {
        if (typeof column === 'string') {
            column = { model: this, name: column };
        }
        this.sortConditions.push(`${SqlUtils_1.default.getColumnInfo(column).expression} ${isDesc ? 'DESC' : 'ASC'}`);
    }
    // /**
    //  * 指定されたリストに基づいてソート条件を追加します。
    //  * @param column ソート対象のカラム名またはColumnInfoTypeオブジェクト
    //  * @param list ソート順を指定する値のリスト
    //  * @param isDesc true: 降順ソート、false: 昇順ソート、null: 昇順ソート
    //  * @returns ソート条件が追加された場合はvoidを返します
    //  */
    // public async orderByList(column: string | ColumnInfoType, list: Array<string | number | boolean | null>, isDesc: boolean | null = null) {
    //     if (typeof(column) == 'string') {
    //         column = new ColumnInfoType(column, this);
    //     }
    //     if (column.ColumnInfo == null) {
    //         throw new SqlException("orderBy_02", `${column.ColumnName}は${column.TableName}に存在しません。`);
    //     }
    //     // 0件はソート不可なので、ソートのPUSHは行わない。
    //     if (list.length === 0) {
    //         return;
    //     }
    //     let orderConditions: Array<string> = [];
    //     for (let i = 0;i < list.length;i++) {
    //         const value = list[i];
    //         if (value === null) {
    //             orderConditions.push(`WHEN ${column.ColumnQuery} is null then ${i}`);
    //         } else if (column.ColumnInfo.Type === ColumnTypeEnum.Number) {
    //             // SQLのエラーを防ぐため、Numberにできる時のみソート
    //             if (NumberUtil.isNumber(value)) {
    //                 orderConditions.push(`WHEN ${column.ColumnQuery} = ${value} then ${i}`);
    //             }
    //         } else if (column.ColumnInfo.Type === ColumnTypeEnum.UUID) {
    //             // SQLのエラーを防ぐため、UUIDにできる時のみソート
    //             if (StringUtil.isErrorRegrex(RegexPatternEnum.uuid, value) === false) {
    //                 orderConditions.push(`WHEN ${column.ColumnQuery} = '${value}' then ${i}`);
    //             }
    //         } else if (column.ColumnInfo.Type === ColumnTypeEnum.String) {
    //             orderConditions.push(`WHEN ${column.ColumnQuery} = '${value}' then ${i}`);
    //         }
    //     }
    //     if (orderConditions.length === 0) {
    //         return;
    //     }
    //     let sql = `CASE ${orderConditions.join(' ')}`;
    //     sql += ` ELSE ${list.length}`;
    //     sql += ` END ${isDesc ? 'DESC' : 'ASC'}`;
    //     this.sortConditions.push(sql);
    // }
    // /**
    //  * 指定されたクエリでソート条件を追加します。
    //  * @param query ソート対象のクエリ
    //  * @param isDesc true: 降順ソート、false: 昇順ソート、null: 昇順ソート
    //  */
    // public async orderBySentence(query: string, isDesc: boolean | null = null) {
    //     this.sortConditions.push(`${query} ${isDesc ? 'DESC' : 'ASC'}`);
    // }
    /**
     * SQL文の実行
     * @param connection connection
     * @returns datas
     */
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
    // /**
    //  * SQL文の実行
    //  * @param connection connection 
    //  * @returns datas
    //  */
    // public async executeSelectWithCount<T = any>(client: PoolClient) {
    //     if (this.selectColumns.length == 0) {
    //         this.select();
    //     }
    //     let sql = ` SELECT ${this.selectColumns.join(",")} ${this.createSqlFromJoinWhereSortLimit}`;
    //     let countSql = ` SELECT COUNT(*) as "count" ${this.createSqlFromJoinWhere}`;
    //     const data = await this.executeQuery(sql, client);
    //     const countData = await this.executeQuery(countSql, client);
    //     return { datas: data.rows as Array<T>, count: Number(countData.rows[0].count), lastPage: Math.ceil(Number(countData.rows[0].count) / this.pageCount)};
    // }
    // /**
    //  * SQLの実行（count）
    //  * @param connection connection
    //  * @returns 件数
    //  */
    // public async executeGetCount(client: PoolClient): Promise<number> {
    //     let sql = ` SELECT COUNT(*) as count ${this.selectColumns.join(",")} ${this.createSqlFromJoinWhere}`;
    //     const data = await this.executeQuery(sql, client);
    //     return Number(data.rows[0].count);
    // }
    // /**
    //  * numberのMaxの数を取得
    //  * @param key キー
    //  * @param connection connection
    //  */
    // public async executeGetMaxNumber(key: string, client: PoolClient) {
    //     let maxSql = `SELECT MAX(${key}) AS "max" ${this.createSqlFromJoinWhere} `;
    //     let datas = await this.executeQuery(maxSql, client);
    //     return datas.rowCount == 0 ? 0 : datas.rows[0].max;
    // }
    // /**
    //  * 指定されたカラムを選択し、グループ化してクエリを実行します。
    //  * @param selectColumns 選択するカラムの配列
    //  * @param groupColumns グループ化するカラムの配列
    //  * @param client データベースクライアントオブジェクト
    //  * @returns クエリの実行結果を返します
    //  */
    // public async executeSelectGroupBy<T>(client: PoolClient, selectColumns: Array<string | {func: AggregateFuncType | null ,column: string | ColumnInfoType, as?: string}>, groupColumns: Array<string | ColumnInfoType> | null = null) {
    //     let selectQueries: Array<string> = [];
    //     const selects = selectColumns.filter(column => {
    //         if (typeof column === 'string') {
    //             selectQueries.push(column);
    //         }
    //         return typeof column !== 'string';            
    //     }).map(column => {
    //         if (typeof column.column === 'string') {
    //             column.column = new ColumnInfoType(column.column, this);
    //         }
    //         return {
    //             func: column.func,
    //             column: column.column,
    //             as: column.as ?? ''
    //         };
    //     });
    //     const groups: Array<ColumnInfoType> = groupColumns === null ? [] : groupColumns.map(column => {
    //         if (typeof column === 'string') {
    //             return new ColumnInfoType(column, this);
    //         }
    //         return column;
    //     })
    //     const fliterSelect = groups.length === 0 ? selects : selects.filter(select => select.func !== null || groups.map(group => group.ColumnQuery).includes(select.column.ColumnQuery));
    //     selectQueries = [...selectQueries, ...fliterSelect.map(select => this.createSelectQuery(select.column, select.func, select.as))];
    //     let sql = `SELECT ${selectQueries.join(',')} ${this.createSqlFromJoinWhere}`;
    //     if (groups.length > 0) {
    //         sql += ` GROUP BY ${groups.map(group => group.ColumnQuery).join(",")}`
    //     }
    //     // ソート、リミット、オフセット項目
    //     if (this.sortConditions.length > 0) {
    //         sql += ` ORDER BY ${this.sortConditions.join(",")}`;
    //     }
    //     if (this.Limit !== undefined && this.Limit !== null) {
    //         sql += ` LIMIT ${this.Limit}`;
    //     }
    //     if (this.Offset !== undefined && this.Offset !== null) {
    //         sql += ` OFFSET ${this.Offset}`;
    //     }
    //     let data = await this.executeQuery(sql, client);
    //     return data.rows as Array<T>;
    // }
    // /**
    //  * レコードが存在するかどうかを確認します。
    //  * @param connection データベース接続オブジェクト。デフォルトはConnection。
    //  * @returns レコードが存在する場合はtrue、存在しない場合はfalse。
    //  */
    // public async executeIsExist(client: PoolClient) {
    //     const count = await this.executeGetCount(client);
    //     return count > 0;
    // }
    // /**
    //  * UPDATE前のバリデーションチェックを行う
    //  * @param updates updates
    //  * @param connection connection
    //  */
    // public async validateUpdate(updates: BaseOptionType, client: PoolClient) : Promise<void> {
    // }
    // /**
    //  * SQL文の実行
    //  * @param connection connection 
    //  * @returns 更新数
    //  */
    // public async executeUpdate(options: BaseOptionType, client: PoolClient) : Promise<number> {
    //     const updates = options.toObject;
    //     await this.validateUpdate(options, client);
    //     await this.validateCommon(options, client);
    //     let sql = `UPDATE ${this.TableName} SET update_at = CURRENT_TIMESTAMP`;
    //     Object.keys(updates).forEach((camelKey) => {
    //         const snakeKey = StringUtil.formatFromCamelToSnake(camelKey);
    //         // idは更新してはいけないので、UPDATE対象から外す
    //         // undefinedは更新対象でないので外す
    //         if (snakeKey in this.Columns == false || snakeKey == 'id' || updates[camelKey] === undefined) {
    //             return;
    //         }
    //         const columnInfo = this.Columns[snakeKey];
    //         sql += `, ${snakeKey} = ${SqlUtil.toSqlValue(columnInfo, updates[camelKey])}`
    //     });
    //     if (this.joinConditions.length > 0) {
    //         // JOIN句ではUSING句を使用して削除する方法はあるが、使用する時に実装します。
    //         // SQL例
    //         // DELETE FROM table1
    //         // USING table2
    //         // WHERE table1.foreign_key = table2.id
    //         // AND table2.some_column = 'some_value';
    //         // this.joinConditions.forEach((joinCondition: { 
    //         //     type: 'left' | 'inner',
    //         //     joinBaseModel: BaseModel,
    //         //     conditions: Array<string>
    //         //     }) => {
    //         //     sql += {
    //         //         'left' : " LEFT OUTER JOIN ",
    //         //         'inner' : " INNER JOIN "
    //         //     }[joinCondition.type];
    //         //     sql += `${joinCondition.joinBaseModel.TableName} as "${joinCondition.joinBaseModel.AsTableName}" ON `;
    //         //     sql += joinCondition.conditions.join(" AND ");
    //         // })
    //     }
    //     if (this.whereConditions.length > 0) {
    //         sql += " WHERE " + this.whereConditions.join(" AND ");
    //     }
    //     let data = await this.executeQuery(sql, client);
    //     return data.rowCount;
    // }
    /**
     * 指定されたIDに基づいてデータを検索します。
     * Searches for data based on the specified ID.
     * @param id 検索するID
     *           The ID to search for.
     * @param selectColumns 取得するカラムの配列、"*" または null
     *                      An array of columns to select, "*" or null.
     * @param selectQueries 追加のクエリの配列、または null
     *                      An array of additional queries, or null.
     * @returns 検索結果のデータ
     *          The data of the search result.
     */
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
    /**
     * Throws a validation error with the specified message.
     * 指定されたメッセージでバリデーションエラーをスローします。
     * @param message The error message.
     *                エラーメッセージ。
     */
    throwValidationError(message) {
        throw new Error(message);
    }
    /**
     * オプションのバリデーションを行います。
     * Validates the options.
     * @param options 検証するオプションのオブジェクト
     * @param options The object containing options to validate
     */
    validateOptions(options, isInsert) {
        var _a;
        for (const [key, value] of Object.entries(options)) {
            if (key in this.Columns === false) {
                throw new Error(`${key}は${this.TableName}テーブルに存在しません。`);
            }
            if (value === undefined) {
                continue;
            }
            const column = this.Columns[key];
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
    /**
     * Performs validation checks during INSERT.
     * INSERT時のバリデーションチェックを行う
     * @param values The values to be inserted.
     * 挿入する値
     * @param connection The database connection.
     * データベース接続
     */
    validateInsert(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            for (const columnKey in this.Columns) {
                const column = this.Columns[columnKey];
                const name = ((_a = column.alias) !== null && _a !== void 0 ? _a : '') === '' ? columnKey : column.alias;
                if (options[columnKey] === undefined || options[columnKey] === null) {
                    // Null許容されていないカラムにNULLを入れようとしているか？
                    if (column.attribute === "primary" || column.attribute === "noDefault") {
                        this.throwValidationError(`${name}を入力してください。`);
                    }
                }
            }
        });
    }
    /**
     * IDを指定してレコードを更新する前のバリデーションチェックを行う
     * @param id 更新対象のレコードのID
     * @param updates 更新する値のオブジェクト。キーはカラム名、値は更新する値。
     * @param connection データベース接続オブジェクト。デフォルトはConnection。
     */
    validateUpdateId(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * 指定されたIDのレコードを削除する前のバリデーションを行います。
     * @param id 削除対象のレコードのID
     * @param connection データベース接続オブジェクト。デフォルトはConnection。
     */
    validateDeleteId(id) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * Executes an insert operation with the provided options.
     * 指定されたオプションで��入操作を実行します。
     * @param options The options for the insert operation.
     * ��入操作のオプション。
     */
    executeInsert(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateOptions(options, true);
            yield this.validateInsert(options);
            const query = QueryUtil_1.default.createInsert(options, this.TableName);
            yield this.executeQuery(query);
        });
    }
    /**
     * 指定されたIDのレコードを更新
     * @param id 更新対象のレコードのID
     * @param updates 更新する値のオブジェクト。キーはカラム名、値は更新する値。
     * @param connection データベース接続オブジェクト。デフォルトはConnection。
     * @returns 更新が成功したかどうかを示すブール値
     */
    executeUpdateId(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            ValidateValueUtil_1.default.validateId(this.Columns, id);
            this.validateOptions(options, false);
            yield this.validateUpdateId(id, options);
            // await this.validateUpdate(options, client);
            const query = QueryUtil_1.default.createUpdateId(id, options, this);
            const data = yield this.executeQuery(query);
            return data.rowCount == 1;
        });
    }
    /**
     * SQL文の実行
     * @param connection connection
     * @returns datas
     */
    executeDeleteId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            ValidateValueUtil_1.default.validateId(this.Columns, id);
            yield this.validateDeleteId(id);
            let sql = `DELETE FROM ${this.TableName} WHERE id = $1`;
            const datas = yield this.executeQuery(sql, [id]);
            return datas.rowCount == 1;
        });
    }
    /**
     * クエリの実行を行う
     * @param sql sql
     * @param client client
     * @returns クエリ実行結果
     */
    executeQuery(param1, vars) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (process.env.IS_OUTPUT_SQL) {
            //     LoggerSql.info("--- Debug Sql ----------");
            //     LoggerSql.info("SQL文");
            //     LoggerSql.info(sql);
            // }
            let sql = '';
            if (typeof param1 === 'string') {
                sql = param1;
            }
            else {
                sql = param1.sql;
                vars = param1.vars;
            }
            const data = yield this.client.query(sql, vars !== null && vars !== void 0 ? vars : []);
            // LoggerSql.info("実行結果");
            if (data.rowCount == 0) {
                // LoggerSql.info("- データなし");
            }
            else {
                let log = "";
                for (let i = 0; i < data.fields.length; i++) {
                    log += i == 0 ? "" : ",";
                    log += data.fields[i].name;
                }
                // LoggerSql.info(log);
                for (let i = 0; i < data.rows.length; i++) {
                    log = "";
                    for (let j = 0; j < data.fields.length; j++) {
                        let key = data.fields[j].name;
                        log += j == 0 ? "" : ",";
                        log += data.rows[i][key];
                    }
                    // LoggerSql.info(log);
                }
            }
            // 初期化項目
            this.selectExpressions = [];
            this.whereExpressions = [];
            this.joinConditions = [];
            this.sortConditions = [];
            this.vars = [];
            this.Offset = null;
            this.Limit = null;
            return data;
        });
    }
}
exports.TableModel = TableModel;
