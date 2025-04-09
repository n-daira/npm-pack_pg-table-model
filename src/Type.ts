import { TableModel } from "./TableModel";

export type TColumnAttribute = "primary" | "nullable" | "hasDefault" | "noDefault";
export type TColumnType = "number" | "string" | "uuid" | "date" | "time" | "timestamp" | "bool";
export type TOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "like" | "ilike" | "h2f_like" | "h2f_ilike" | "in" | "not in";
export type TColumnInfo = { model: TableModel, name: string }
export type TSelectAlias = { alias: string, as: string }
export type AggregateFuncType = 'sum' | 'ave';
