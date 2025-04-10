import { PoolClient } from 'pg';

declare module 'test_table_model' {
    export type TColumn = { alias?: string, type: TColumnType, length?: number, attribute: TColumnAttribute};
    export type TColumnAttribute = "primary" | "nullable" | "hasDefault" | "noDefault";
    export type TColumnType = "number" | "string" | "uuid" | "date" | "time" | "timestamp" | "bool";
    export type TOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "like" | "ilike" | "h2f_like" | "h2f_ilike" | "in" | "not in";
    export type TSelectExpression = { expression: string, alias: string }

    export class TableModel {
        protected columns: { [key: string]: TColumn };
        get Columns(): { [key: string]: TColumn };
        protected tableName: string;
        get TableName(): string;
        get AsTableName(): string;

        constructor(client: PoolClient, asName: string);
        constructor(client: PoolClient);

        public findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null, selectExpressions: Array<TSelectExpression> | null): Promise<T | null>;
        public findId<T = {[key: string]: any}>(id: any, selectColumns: Array<string> | "*" | null): Promise<T | null>;
        public findId<T = {[key: string]: any}>(id: any): Promise<T | null>;

        protected throwValidationError(message: string): never;
        protected validateOptions(options: {[key: string]: any}, isInsert: boolean) : void;
        protected validateInsert(options: {[key: string]: any}) : Promise<void>;
        protected validateUpdateId(id: any, options: {[key: string]: any}) : Promise<void>;
        protected validateDeleteId(id: any) : Promise<void>;
        public executeInsert(options: {[key: string]: any}) : Promise<void>;
        public executeUpdateId(id: any, options: {[key: string]: any}) : Promise<boolean>;
        public executeDeleteId(id: any) : Promise<boolean>;
    }
}