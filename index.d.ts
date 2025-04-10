import { PoolClient } from 'pg';

declare module 'test_table_model' {
    export type TColumnAttribute = "primary" | "nullable" | "hasDefault" | "noDefault";
    export type TColumnType = "number" | "string" | "uuid" | "date" | "time" | "timestamp" | "bool";
    export type TOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "like" | "ilike" | "h2f_like" | "h2f_ilike" | "in" | "not in";
    export type TSelectExpression = { expression: string, alias: string }

    export class TableModel {
        protected columns: { [key: string]: { alias?: string, type: TColumnType, length?: number, attribute: TColumnAttribute} };
        get Columns(): { [key: string]: { alias?: string, type: TColumnType, length?: number, attribute: TColumnAttribute} };
        protected tableName: string;
        get TableName(): string;
        get AsTableName(): string;

        constructor(client: PoolClient, asName: string);
        constructor(client: PoolClient);

        public find<T = {[key: string]: any}>(id: string, selectColumns: Array<string> | "*" | null, selectAliases: Array<TSelectExpression> | null): Promise<T | null>;
        public find<T = {[key: string]: any}>(id: string, selectColumns: Array<string> | "*" | null): Promise<T | null>;
        public find<T = {[key: string]: any}>(id: string): Promise<T | null>;

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