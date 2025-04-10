import { TableModel } from "./TableModel";

export type TSqlValue = string | number | boolean | Date | null;
export type TColumnAttribute = "primary" | "nullable" | "hasDefault" | "noDefault";
export type TColumnType = "number" | "string" | "uuid" | "date" | "time" | "timestamp" | "bool";
export type TOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "like" | "ilike" | "h2f_like" | "h2f_ilike" | "in" | "not in";
export type TColumnInfo = { model: TableModel, name: string }
export type TSelectExpression = { expression: string, alias: string }
export type TAggregateFuncType = 'sum' | 'ave';
export type TCondition = string | {
    l: string | TColumnInfo, 
    o: TOperator, 
    r: TSqlValue | null | Array<TSqlValue> | TColumnInfo
};
export type TNestedCondition = TCondition | ['AND' | 'OR', ...TNestedCondition[]] | TNestedCondition[];
