"use strict";
// import { TableModel } from "../TableModel";
// import { TColumnInfo, TColumnType, TNestedCondition, TOperator, TSqlValue } from "../Type";
// import SqlUtil from "./SqlUtils";
// export default class WhereExpression {
//     /**
//      * OR条件を作成するためのヘルパーメソッド
//      * @param conditions OR条件を構成する条件の配列
//      * @returns OR条件を表すSQLクエリ文字列
//      */
//     static createCondition(conditions: Array<TNestedCondition>, model: TableModel): string {
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
//                 queryConditions.push(this.createCondition(condition, model));
//                 continue;
//             }
//             if (typeof condition === 'string') {
//                 // 文字列で直接指定した場合はクエリ分となるため、そのまま挿入
//                 queryConditions.push(condition);
//                 continue;
//             }
//             if (typeof condition.l === 'string') {
//                 queryConditions.push(this.createWhere(
//                     { model: model, name: condition.l },
//                     condition.o,
//                     condition.r
//                 ));
//                 continue;
//             }
//             queryConditions.push(this.createWhere(condition.l, condition.o, condition.r));
//         }
//         return `(${queryConditions.filter(condition => condition ?? '' !== '').join(` ${logicalOperator} `)})`;
//     }
//     /**
//      * U01 WHERE句を生成するメソッド
//      * @param leftColumn 左側のカラム情報
//      * @param operator 演算子
//      * @param rightColumn 右側のカラム情報または値
//      * @returns WHERE句の文字列
//      */
//     static createWhere(left: TColumnInfo, operator: TOperator, rightColumn: TSqlValue | null | Array<TSqlValue> | TColumnInfo) : string {
//         // 指定したColumnInfoは存在するか？
//         const leftColumn = SqlUtil.getColumnInfo(left);
//         // 演算子はそれぞれ正しいか？
//         const useableOperator: { [key in TColumnType]: string[] } = {
//             number: ["=", "!=", ">", ">=", "<", "<=", "in", "not in"],
//             string: ["=", "!=", "like", "ilike", "h2f_like", "h2f_ilike", "in", "not in"],
//             uuid: ["=", "!=", "in", "not in"],
//             bool: ["=", "!=", "in", "not in"],
//             date: ["=", "!=", ">", ">=", "<", "<="],
//             time: ["=", "!=", ">", ">=", "<", "<="],
//             timestamp: ["=", "!=", ">", ">=", "<", "<="]
//         };
//         if (useableOperator[leftColumn.type].includes(operator) == false) {
//             throw new Error(`${leftColumn.tableName}.${leftColumn.columnName}は${operator}演算子を使用することはできません。(${leftColumn.type})`);
//         }
//         // IN NOT IN句
//         if (["in", "not in"].includes(operator)) {
//             if (Array.isArray(rightColumn) == false) {
//                 throw new Error(`in演算子の場合、右辺に配列以外を入力することはできません。`);
//             }
//             if (rightColumn.length == 0) {
//                 // 配列が0個の場合にin ,not inを作成するとエラーになるが、渡すデータとしてはあっており、
//                 // データ返却の期待値は変わらないため、0個の場合は検索しないようにする
//                 return '';
//             }
//             let sqlValues = [];
//             for (const value of rightColumn) {
//                 sqlValues.push(this.toSqlValue(leftColumn.ColumnInfo.type, leftColumn.ColumnInfo.attribute, value));
//             }
//             return `${leftColumn.ColumnQuery} ${operator} (${sqlValues.join(',')})`;
//         } else if (Array.isArray(rightColumn)) {
//             throw new Error(`in演算子以外の場合、右辺に配列を入力することはできません。`);
//         }
//         // 右側の値がコラム指定の場合
//         if (rightColumn instanceof ColumnInfoType) {
//             if (rightColumn.ColumnInfo == null) {
//                 throw new Error( `右辺の[${rightColumn.TableName}]に"${rightColumn.ColumnName}"というカラムは存在しません。`);
//             }
//             if (leftColumn.ColumnInfo.type != rightColumn.ColumnInfo.type) {
//                 throw new Error(`[${leftColumn.TableName}].[${leftColumn.ColumnName}]は${operator}演算子を使用することはできません。(${leftColumn.ColumnInfo.type})`);
//             }
//             // LIKE演算子は変わるので別途処理
//             switch (operator) {
//                 case 'like':
//                 case 'ilike':
//                     return `${leftColumn.ColumnQuery} ${operator} '%' || ${rightColumn.ColumnQuery} || '%'`;
//                 case 'h2f_like': // half to full like
//                 case 'h2f_ilike': // half to full ilike
//                     return `${this.makeSqlReplaceHalfToFull(leftColumn.ColumnQuery)} ${operator.replace("h2f_", "")} ${this.makeSqlReplaceHalfToFull(`'%' || ${rightColumn.ColumnQuery} || '%'`)}`;
//             }
//             return `${leftColumn.ColumnQuery} ${operator} ${rightColumn.ColumnQuery}`;
//         }
//         if (rightColumn == null) {
//             if (operator == "=") {
//                 return `${leftColumn.ColumnQuery} is null`;
//             } else if (operator == "!=") {
//                 return `${leftColumn.ColumnQuery} is not null`;
//             } else {
//                 throw new Error(`[${leftColumn.TableName}].[${leftColumn.ColumnName}]は${operator}演算子を使用することはできません。(${leftColumn.ColumnInfo.type})`);
//             }
//         }
//         // LIKE演算子は変わるので別途処理
//         switch (operator) {
//             case 'like':
//             case 'ilike':
//                 return `${leftColumn.ColumnQuery} ${operator} '%${rightColumn}%'`;
//             case 'h2f_like': // half to full like
//             case 'h2f_ilike': // half to full ilike
//                 return `${this.makeSqlReplaceHalfToFull(leftColumn.ColumnQuery)} ${operator.replace("h2f_", "")} ${this.makeSqlReplaceHalfToFull(`'%${rightColumn}%'`)}`;
//         }
//         return `${leftColumn.ColumnQuery} ${operator} ${SqlUtil.toSqlValue(leftColumn.ColumnInfo.type, leftColumn.ColumnInfo.attribute, rightColumn)}`;
//     }
// }
