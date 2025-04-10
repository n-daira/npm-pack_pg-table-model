import { TColumnAttribute, TColumnInfo, TColumnType, TOperator } from "../Type";

export type SqlValueParamType = string | number | boolean | Date | null;

export default class SqlUtil {

    // /**
    //  * U01 WHERE句を生成するメソッド
    //  * @param leftColumn 左側のカラム情報
    //  * @param operator 演算子
    //  * @param rightColumn 右側のカラム情報または値
    //  * @returns WHERE句の文字列
    //  */
    // static createWhere(leftColumn: ColumnInfoType, operator: TOperator, rightColumn: SqlValueParamType | Array<SqlValueParamType> | ColumnInfoType) : string {

    //     // 指定したColumnInfoは存在するか？
    //     if (leftColumn.ColumnInfo == null) {
    //         throw new Error(`左辺の[${leftColumn.TableName}]に"${leftColumn.ColumnName}"というカラムは存在しません。`);
    //     }

    //     // 演算子はそれぞれ正しいか？
    //     const useableOperator: { [key in TColumnType]: string[] } = {
    //         number: ["=", "!=", ">", ">=", "<", "<=", "in", "not in"],
    //         string: ["=", "!=", "like", "ilike", "h2f_like", "h2f_ilike", "in", "not in"],
    //         uuid: ["=", "!=", "in", "not in"],
    //         bool: ["=", "!=", "in", "not in"],
    //         date: ["=", "!=", ">", ">=", "<", "<="],
    //         time: ["=", "!=", ">", ">=", "<", "<="],
    //         timestamp: ["=", "!=", ">", ">=", "<", "<="]
    //     };

    //     if (useableOperator[leftColumn.ColumnInfo.type].includes(operator) == false) {
    //         throw new Error(`[${leftColumn.TableName}].[${leftColumn.ColumnName}]は${operator}演算子を使用することはできません。(${leftColumn.ColumnInfo.type})`);
    //     }

    //     // IN NOT IN句
    //     if (["in", "not in"].includes(operator)) {
    //         if (Array.isArray(rightColumn) == false) {
    //             throw new Error(`in演算子の場合、右辺に配列以外を入力することはできません。`);
    //         }

    //         if (rightColumn.length == 0) {
    //             // 配列が0個の場合にin ,not inを作成するとエラーになるが、渡すデータとしてはあっており、
    //             // データ返却の期待値は変わらないため、0個の場合は検索しないようにする
    //             return '';
    //         }
    //         let sqlValues = [];
    //         for (const value of rightColumn) {
    //             sqlValues.push(this.toSqlValue(leftColumn.ColumnInfo.type, leftColumn.ColumnInfo.attribute, value));
    //         }
    //         return `${leftColumn.ColumnQuery} ${operator} (${sqlValues.join(',')})`;
    //     } else if (Array.isArray(rightColumn)) {
    //         throw new Error(`in演算子以外の場合、右辺に配列を入力することはできません。`);
    //     }

    //     // 右側の値がコラム指定の場合
    //     if (rightColumn instanceof ColumnInfoType) {
    //         if (rightColumn.ColumnInfo == null) {
    //             throw new Error( `右辺の[${rightColumn.TableName}]に"${rightColumn.ColumnName}"というカラムは存在しません。`);
    //         }

    //         if (leftColumn.ColumnInfo.type != rightColumn.ColumnInfo.type) {
    //             throw new Error(`[${leftColumn.TableName}].[${leftColumn.ColumnName}]は${operator}演算子を使用することはできません。(${leftColumn.ColumnInfo.type})`);
    //         }

    //         // LIKE演算子は変わるので別途処理
    //         switch (operator) {
    //             case 'like':
    //             case 'ilike':
    //                 return `${leftColumn.ColumnQuery} ${operator} '%' || ${rightColumn.ColumnQuery} || '%'`;
    //             case 'h2f_like': // half to full like
    //             case 'h2f_ilike': // half to full ilike
    //                 return `${this.makeSqlReplaceHalfToFull(leftColumn.ColumnQuery)} ${operator.replace("h2f_", "")} ${this.makeSqlReplaceHalfToFull(`'%' || ${rightColumn.ColumnQuery} || '%'`)}`;
    //         }

    //         return `${leftColumn.ColumnQuery} ${operator} ${rightColumn.ColumnQuery}`;
    //     }

    //     if (rightColumn == null) {
    //         if (operator == "=") {
    //             return `${leftColumn.ColumnQuery} is null`;
    //         } else if (operator == "!=") {
    //             return `${leftColumn.ColumnQuery} is not null`;
    //         } else {
    //             throw new Error(`[${leftColumn.TableName}].[${leftColumn.ColumnName}]は${operator}演算子を使用することはできません。(${leftColumn.ColumnInfo.type})`);
    //         }
    //     }

    //     // LIKE演算子は変わるので別途処理
    //     switch (operator) {
    //         case 'like':
    //         case 'ilike':
    //             return `${leftColumn.ColumnQuery} ${operator} '%${rightColumn}%'`;
    //         case 'h2f_like': // half to full like
    //         case 'h2f_ilike': // half to full ilike
    //             return `${this.makeSqlReplaceHalfToFull(leftColumn.ColumnQuery)} ${operator.replace("h2f_", "")} ${this.makeSqlReplaceHalfToFull(`'%${rightColumn}%'`)}`;
    //     }

    //     return `${leftColumn.ColumnQuery} ${operator} ${SqlUtil.toSqlValue(leftColumn.ColumnInfo.type, leftColumn.ColumnInfo.attribute, rightColumn)}`;
    // }

    // /**
    //  * 日付を比較するWHERE句を生成するメソッド
    //  * @param leftColumn 左側のカラム情報
    //  * @param operator 演算子
    //  * @param date 比較する日付のタイプ ("DATE" または "TIMESTAMP")
    //  * @returns WHERE句の文字列
    //  */
    // static createWhereCompareDate(leftColumn: ColumnInfoType, operator: OperatorParamType, date: "DATE" | "TIMESTAMP") : string {
        
    //     // 指定したColumnInfoは存在するか？
    //     if (leftColumn.ColumnInfo == null) {
    //         throw new Error(`[${leftColumn.TableName}]に"${leftColumn.ColumnName}"というカラムは存在しません。`);
    //     }

    //     if (leftColumn.ColumnInfo.type !== ColumnTypeEnum.Date && leftColumn.ColumnInfo.type != ColumnTypeEnum.Timestamp) {
    //         throw new Error(`[${leftColumn.TableName}].[${leftColumn.ColumnName}]は日付比較できません。`);
    //     }

    //     if (["=", "!=", ">", ">=", "<", "<="].includes(operator) == false) {
    //         throw new Error(`日付比較で${operator}演算子を使用することはできません。`);
    //     }

    //     return `${leftColumn.ColumnQuery} ${operator} CURRENT_${date}`;
    // }


    // /**
    //  * U02 SQLの登録、編集時の値を変換
    //  * @param {string} key キー
    //  * @param {string | number} value 値
    //  */
    // static toSqlValue(type: TColumnType, attribute: TColumnAttribute, value: any) : string {

    //     if (value === undefined) {
    //         throw new Error(`valueにundefinedは挿入しないでください。`);
    //     }

    //     // nullチェック
    //     if (value === null) {
    //         if (attribute === "nullable") {
    //             return 'null';
    //         } else {
    //             throw new Error(`${attribute}のカラムにnullを挿入することはできません。(value : ${value})`);
    //         }
    //     }

    //     return ToValueUtil.toValue(type, value);
    // }
}