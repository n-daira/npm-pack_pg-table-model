import { Pool, PoolClient } from 'pg';

declare module 'pg-table-model' {
    export type TSqlValue = string | number | boolean | Date | null;
    export type TColumn = { alias?: string, type: TColumnType, length?: number, attribute: TColumnAttribute, default?: string, fk?: {table: string, column: string}, comment?: string};
    export type TColumnAttribute = "primary" | "nullable" | "hasDefault" | "noDefault";
    export type TColumnType = "number" | "string" | "uuid" | "date" | "time" | "timestamp" | "bool";
    export type TOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "like" | "ilike" | "h2f_like" | "h2f_ilike" | "in" | "not in";
    export type TColumnInfo = { model: TableModel, name: string }
    export type TQuery = {sql: string, vars?: Array<any>};
    export type TSelectExpression = { expression: string, alias: string }
    export type TAggregateFuncType = 'sum' | 'avg' | 'max' | 'min' | 'count';
    export type TCondition = string | {
        l: string | TColumnInfo, 
        o: TOperator, 
        r: TSqlValue | Array<TSqlValue> | TColumnInfo
    };
    export type TNestedCondition = TCondition | ['AND' | 'OR', ...TNestedCondition[]] | TNestedCondition[];
    export type TSortKeyword = 'desc' | 'asc';
    export type TKeyFormat = 'snake' | 'lowerCamel';

    export class TableModel {
        protected readonly dbName: string;
        get DbName(): string;
        protected readonly tableName: string;
        get TableName(): string;
        protected readonly tableDescription: string;
        get TableDescription(): string;
        protected readonly comment: string;
        get Comment(): string;
        protected readonly columns: { [key: string]: TColumn };
        get Columns(): { [key: string]: TColumn };
        get TableAlias(): string;
        public IsOutputLog: boolean;
        public SortKeyword: TSortKeyword;
        public Offset: number;
        public Limit: number;
        public PageCount: number;
        set OffsetPage(value: number);

        constructor(client: PoolClient);
        constructor(client: PoolClient, tableAlias: string);

        public select(): void;
        public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*'): void;
        public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*', model: TableModel): void;
        public select(expression: string, alias: string): void;

        public select(): void;
        public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*'): void;
        public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*', model: TableModel): void;
        public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*', keyFormat: TKeyFormat): void;
        public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*', model: TableModel, keyFormat: TKeyFormat): void;
        public select(expression: string, alias: string): void;

        public join(joinType: 'left' | 'inner', joinModel: TableModel, conditions: Array<TNestedCondition>): void;

        public where(expression: string): void;
        public where(conditions: Array<TNestedCondition>): void;
        public where(left: string, operator: TOperator, right: TSqlValue | Array<TSqlValue> | TColumnInfo | null): void;
        public where(left: TColumnInfo, operator: TOperator, right: TSqlValue | Array<TSqlValue> | TColumnInfo | null): void;

        public find<T = {[key: string]: any}>(pk: {[key: string]: any}, selectColumns: Array<string> | "*" | null, selectExpressions: Array<TSelectExpression> | null, keyFormat: TKeyFormat): Promise<T | null>;
        public find<T = {[key: string]: any}>(pk: {[key: string]: any}, selectColumns: Array<string> | "*" | null, selectExpressions: Array<TSelectExpression> | null): Promise<T | null>;
        public find<T = {[key: string]: any}>(pk: {[key: string]: any}, selectColumns: Array<string> | "*" | null): Promise<T | null>;
        public find<T = {[key: string]: any}>(pk: {[key: string]: any}): Promise<T | null>;

        public findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null, selectExpressions: Array<TSelectExpression> | null, keyFormat: TKeyFormat): Promise<T | null>;
        public findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null, selectExpressions: Array<TSelectExpression> | null): Promise<T | null>;
        public findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null): Promise<T | null>;
        public findId<T = {[key: string]: any}>(id: any): Promise<T | null>;

        protected readonly errorMessages: Record<TColumnType | 'length' | 'null' | 'notInput', string>
        protected throwValidationError(code: string, message: string): never;
        protected validateOptions(options: {[key: string]: TSqlValue}, isInsert: boolean) : Promise<void>;
        protected validateInsert(options: {[key: string]: TSqlValue}) : Promise<void>;
        protected validateUpdate(options: {[key: string]: TSqlValue}) : Promise<void>;
        protected validateUpdateId(id: any, options: {[key: string]: TSqlValue}) : Promise<void>;
        protected validateDelete() : Promise<void>;
        protected validateDeleteId(id: any) : Promise<void>;

        public executeInsert(options: {[key: string]: TSqlValue}) : Promise<void>;
        public executeUpdate(options: {[key: string]: TSqlValue}) : Promise<number>;
        public executeUpdateId(id: any, options: {[key: string]: TSqlValue}) : Promise<boolean>;
        public executeDelete() : Promise<number>;
        public executeDeleteId(id: any) : Promise<boolean>;

        public executeSelect<T = {[key: string]: any}>(): Promise<Array<T>>;
        public executeSelectWithCount<T = any>(): Promise<{ datas: Array<T>, count: number, lastPage: number}>;

        protected executeQuery(param1: string, vars?: Array<any>) : Promise<any>;
        protected executeQuery(param1: TQuery) : Promise<any>;

        public orderBy(column: string | TColumnInfo, sortKeyword: TSortKeyword): void;
        public orderByList(column: string | TColumnInfo, list: Array<string | number | boolean | null>, sortKeyword: TSortKeyword): void;
        public orderBySentence(query: string, sortKeyword: TSortKeyword): void;

        public groupBy(column: string | TColumnInfo): void;
    }

    export function createTableDoc(models: Array<TableModel>): string;
    export function migrate(migrates: Array<MigrateTable>, pool: Pool): Promise<void>;
    export function migrate(migrates: Array<MigrateTable>, pool: Pool): Promise<void>;
    export function rollback(toNumber: number, pool: Pool): Promise<void>;
    export function rollback(toNumber: number, pool: Pool): Promise<void>;
    export class MigrateTable {
        protected readonly migrateSql: string;
        protected readonly rollbackSql: string;
        protected readonly addGrantTables: Array<string>;
        protected readonly user: string;
    }

    export class MigrateDatabase {
        constructor(dbName: string, userName: string, pool: Pool);
    
        get DbName(): string;
        get UserName(): string;
        get Password(): string | null;
    
        public IsExistUser(): Promise<boolean>;
        public CreateUser(password?: string): Promise<void>;
        public IsExistDb(): Promise<boolean>;
        public CreateDb(collateType?: string): Promise<void>;
        public RollbackDbSql(): string;
        public RollbackUserSql(otherUserName: string): string;
    }
}