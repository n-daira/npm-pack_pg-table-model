"use strict";
// import moment from "moment-timezone";
// import RegexPatternEnum from "../../../types/RegexPatternEnum";
// import DateTimeUtil from "../../../utils/DateTimeUtil";
// import StringUtil from "../../../utils/StringUtil";
// import ColumnTypeEnum from "../../../types/models/ColumnTypeEnum";
// // import { NestedWhereCondition } from "./BaseModel";
// import SqlUtil from "../../../utils/SqlUtil";
// import { TableModel } from "./TableModel";
// import { ColumnInfoType }from "./ColumnInfoType";
// export type SqlValueParamType = string | number | boolean | Date | null;
// export type OperatorParamType = "=" | "!=" | ">" | ">=" | "<" | "<=" | "like" | "ilike" | "h2f_like" | "h2f_ilike" | "in" | "not in";
// export type ConditionType = string | {
//     l: string | ColumnInfoType, 
//     o: OperatorParamType, 
//     r: string | number | boolean | Date | null | Array<SqlValueParamType> | ColumnInfoType
// };
// export type NestedConditionType = ConditionType | ['AND' | 'OR', ...NestedConditionType[]] | NestedConditionType[];
// export default class SqlAdapter {
//     /**
//      * OR条件を作成するためのヘルパーメソッド
//      * @param conditions OR条件を構成する条件の配列
//      * @returns OR条件を表すSQLクエリ文字列
//      */
//     public createCondition(conditions: Array<NestedConditionType>, baseModel: TableModel): string {
//         if (conditions.length === 0) {
//             return '';
//         }
//         let logicalOperator = 'AND';
//         if (conditions[0] === 'AND' || conditions[0] === 'OR') {
//             if (conditions.length === 1) {
//                 return '';
//             }
//             logicalOperator = conditions[0];
//             conditions.shift();
//         }
//         let queryConditions: string[] = [];
//         for (let condition of conditions) {
//             if (Array.isArray(condition)) {
//                 // 配列の場合はネストした条件になるため、再起的にこの関数を呼び出す
//                 queryConditions.push(this.createCondition(condition, baseModel));
//                 continue;
//             }
//             if (typeof condition === 'string') {
//                 // 文字列で直接指定した場合はクエリ分となるため、そのまま挿入
//                 queryConditions.push(condition);
//                 continue;
//             }
//             if (typeof condition.l === 'string') {
//                 queryConditions.push(SqlUtil.createWhere(
//                     new ColumnInfoType(condition.l, baseModel),
//                     condition.o,
//                     condition.r
//                 ));
//                 continue;
//             }
//             queryConditions.push(SqlUtil.createWhere(condition.l, condition.o, condition.r));
//         }
//         return `(${queryConditions.filter(condition => condition ?? '' !== '').join(` ${logicalOperator} `)})`;
//     }
//     /**
//      * 指定されたカラムまたはクエリと日付を使用して、SQLクエリを生成します。
//      * @param leftColumnOrQuery - SQLクエリの左側に使用するカラム名またはクエリ
//      * @param date - クエリに使用する日付
//      * @returns SQLクエリ文字列
//      */
//     public createConditionTimestampToDate(leftColumnOrQuery: string | ColumnInfoType, operator: OperatorParamType , date: string | Date = new Date()): string {
//         const column = typeof leftColumnOrQuery == 'string' ? leftColumnOrQuery : leftColumnOrQuery.ColumnQuery;
//         if (["=", "!=", ">", ">=", "<", "<="].includes(operator) === false) {
//             throw new Error(`${operator}は"=", "!=", ">", ">=", "<", "<="のいずれかで入力してください。`);
//         }
//         return `DATE(${column}) ${operator} ${this.toSqlValueDate(date)}`;
//     }
//     // ************************************************************************************
//     // 値をSQLで使用できるようにするメソッド群（TVはToValueの略）
//     // ************************************************************************************
//     /**
//      * 指定された値をSQLの日付形式に変換します。
//      * @param value 変換する値。文字列またはDate型。
//      * @returns SQLの日付形式の文字列。
//      * @throws SqlException 指定された値が無効な場合。
//      */
//     protected toSqlValueDate(value: string | Date) {
//         if (typeof(value) == 'string') {
//             // yyyy-MM-dd形式かチック
//             if (StringUtil.isErrorRegrex(RegexPatternEnum.date, value)) {
//                 throw new Error(`${value}はyyyy-mm-dd形式の文字列ではありません。`);
//             }
//             if (DateTimeUtil.isErrorDateTime(`${value} 00:00:00`)) {
//                 throw new Error(`${value}は日付に変換できませんでした。`);
//             }
//             return `'${value}'`;
//         } else if (value instanceof Date) {
//             return `'${moment(value).tz('Asia/Tokyo').format('YYYY-MM-DD')}'`;
//         }
//         throw new Error(`${value}はyyyy-mm-ddの文字列、またはDate型で入力してください。`);
//     }
//     /**
//      * 指定された値をSQLの日時形式に変換します。
//      * @param value 変換する値。文字列またはDate型。
//      * @returns SQLの日時形式の文字列。
//      * @throws SqlException 指定された値が無効な場合。
//      */
//     public toSqlValueDateTime(value: string | Date) {
//         if (typeof(value) == 'string') {
//             let datetime = '';
//             if (StringUtil.isErrorRegrex(RegexPatternEnum.date, value) == false) {
//                 datetime = `${value} 00:00:00`;
//             } else if (StringUtil.isErrorRegrex(RegexPatternEnum.datetime, value) == false) {
//                 // フロントからYYYY-MM-DDTHH:MI:SS形式でくるため、この形式でも許容する
//                 datetime = `${value.replace("T", " ")}`;
//             } else {
//                 throw new Error(`${value}はyyyy-mm-dd またはyyyy-mm-dd hh:mmi:ss形式の文字列ではありません。`);
//             }
//             if (DateTimeUtil.isErrorDateTime(datetime)) {
//                 throw new Error(`${value}は日付に変換できませんでした。`);
//             }
//             return `'${value}'`;
//         } else if (value instanceof Date) {
//             return `'${moment(value).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss')}'`;
//         }
//         throw new Error(`${value}はyyyy-mm-ddの文字列、またはDate型で入力してください。`);
//     }
// }
