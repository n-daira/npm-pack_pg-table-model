import { PoolClient } from 'pg';

declare module 'test_table_model' {
    export type TSqlValue = string | number | boolean | Date;
    export type TColumn = { alias?: string, type: TColumnType, length?: number, attribute: TColumnAttribute};
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
        r: TSqlValue | null | Array<TSqlValue> | TColumnInfo
    };
    export type TNestedCondition = TCondition | ['AND' | 'OR', ...TNestedCondition[]] | TNestedCondition[];
    export type TSortKeyword = 'desc' | 'asc';

    export class TableModel {
        protected columns: { [key: string]: TColumn };
        get Columns(): { [key: string]: TColumn };
        protected tableName: string;
        get TableName(): string;
        get AsTableName(): string;
        public IsOutputLog: boolean;
        public SortKeyword: TSortKeyword;
        public Offset: number;
        public Limit: number;

        constructor(client: PoolClient, asName: string);
        constructor(client: PoolClient);

        public select(): void;
        public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*'): void;
        public select(columls: Array<string | {name: string, alias?: string, func?: TAggregateFuncType}> | '*', model: TableModel): void;
        public select(expression: string, alias: string): void;

        public join(joinType: 'left' | 'inner', joinModel: TableModel, conditions: Array<TNestedCondition>): void;

        public where(expression: string): void;
        public where(conditions: Array<TNestedCondition>): void;
        public where(left: string, operator: TOperator, right: TSqlValue | Array<TSqlValue> | TColumnInfo | null): void;
        public where(left: TColumnInfo, operator: TOperator, right: TSqlValue | Array<TSqlValue> | TColumnInfo | null): void;

        public findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null, selectExpressions: Array<TSelectExpression> | null): Promise<T | null>;
        public findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null): Promise<T | null>;
        public findId<T = {[key: string]: any}>(id: any): Promise<T | null>;

        protected throwValidationError(message: string): never;
        protected validateOptions(options: {[key: string]: TSqlValue}, isInsert: boolean) : void;
        protected validateInsert(options: {[key: string]: TSqlValue}) : Promise<void>;
        protected validateUpdate(options: {[key: string]: TSqlValue}) : Promise<void>;
        protected validateUpdateId(id: any, options: {[key: string]: TSqlValue}) : Promise<void>;
        protected validateDeleteId(id: any) : Promise<void>;
        public executeInsert(options: {[key: string]: TSqlValue}) : Promise<void>;
        public executeUpdateId(id: any, options: {[key: string]: TSqlValue}) : Promise<boolean>;
        public executeDeleteId(id: any) : Promise<boolean>;

        public executeSelect<T = {[key: string]: any}>(): Promise<Array<T>>;

        public orderBy(column: string | TColumnInfo, sortKeyword: TSortKeyword): void;
        public orderByList(column: string | TColumnInfo, list: Array<string | number | boolean | null>, sortKeyword: TSortKeyword): void;
        public orderBySentence(query: string, sortKeyword: TSortKeyword): void;

        public groupBy(column: string | TColumnInfo): void;
    }
}