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

    /**
     * 半角文字を全角に変換するSQL文
     * @param {string} columnName カラム名
     * @returns SQL文
     */
    static makeSqlReplaceHalfToFull(columnNameOrValue: string) {
        const num = {
            '０' : '0', '１' : '1', '２' : '2', '３' : '3', '４' : '4',
            '５' : '5', '６' : '6', '７' : '7', '８' : '8', '９' : '9'
        };

        const kana = {
            'ア' : 'ｱ', 'イ' : 'ｲ', 'ウ' : 'ｳ', 'エ' : 'ｴ', 'オ' : 'ｵ',
            'カ' : 'ｶ', 'キ' : 'ｷ', 'ク' : 'ｸ', 'ケ' : 'ｹ', 'コ' : 'ｺ',
            'サ' : 'ｻ', 'シ' : 'ｼ', 'ス' : 'ｽ', 'セ' : 'ｾ', 'ソ' : 'ｿ',
            'タ' : 'ﾀ', 'チ' : 'ﾁ', 'ツ' : 'ﾂ', 'テ' : 'ﾃ', 'ト' : 'ﾄ',
            'ナ' : 'ﾅ', 'ニ' : 'ﾆ', 'ヌ' : 'ﾇ', 'ネ' : 'ﾈ', 'ノ' : 'ﾉ',
            'ハ' : 'ﾊ', 'ヒ' : 'ﾋ', 'フ' : 'ﾌ', 'ヘ' : 'ﾍ', 'ホ' : 'ﾎ',
            'マ' : 'ﾏ', 'ミ' : 'ﾐ', 'ム' : 'ﾑ', 'メ' : 'ﾒ', 'モ' : 'ﾓ',
            'ヤ' : 'ﾔ', 'ユ' : 'ﾕ', 'ヨ' : 'ﾖ',
            'ラ' : 'ﾗ', 'リ' : 'ﾘ', 'ル' : 'ﾙ', 'レ' : 'ﾚ', 'ロ' : 'ﾛ',
            'ワ' : 'ﾜ', 'ヲ' : 'ｦ', 'ン' : 'ﾝ',
            'ヴ' : 'ｳﾞ',
            'ガ' : 'ｶﾞ', 'ギ' : 'ｷﾞ', 'グ' : 'ｸﾞ', 'ゲ' : 'ｹﾞ', 'ゴ' : 'ｺﾞ',
            'ザ' : 'ｻﾞ', 'ジ' : 'ｼﾞ', 'ズ' : 'ｽﾞ', 'ゼ' : 'ｾﾞ', 'ゾ' : 'ｿﾞ',
            'ダ' : 'ﾀﾞ', 'ヂ' : 'ﾁﾞ', 'ヅ' : 'ﾂﾞ', 'デ' : 'ﾃﾞ', 'ド' : 'ﾄﾞ',
            'バ' : 'ﾊ', 'ビ' : 'ﾋﾞ', 'ブ' : 'ﾌﾞ', 'ベ' : 'ﾍﾞ', 'ボ' : 'ﾎﾞ',
            'パ' : 'ﾊﾟ', 'ピ' : 'ﾋﾟ', 'プ' : 'ﾌﾟ', 'ペ' : 'ﾍﾟ', 'ポ' : 'ﾎﾟ',
            'ァ' : 'ｧ', 'ィ' : 'ｨ', 'ゥ' : 'ｩ', 'ェ' : 'ｪ', 'ォ' : 'ｫ',
            'ャ' : 'ｬ', 'ュ' : 'ｭ', 'ョ' : 'ｮ',
            'ッ' : 'ｯ',
            'ー' : 'ｰ', '、' : '､', '。' : '｡', '・' : '･', '「' : '｢', '」' : '｣', '゛' : ' ﾞ', '゜' : ' ﾟ'
        };

        const alpha = {
            'Ａ' : 'A', 'Ｂ' : 'B', 'Ｃ' : 'C', 'Ｄ' : 'D', 'Ｅ' : 'E', 'Ｆ' : 'F', 'Ｇ' : 'G',
            'Ｈ' : 'H', 'Ｉ' : 'I', 'Ｊ' : 'J', 'Ｋ' : 'K', 'Ｌ' : 'L', 'Ｍ' : 'M', 'Ｎ' : 'N',
            'Ｏ' : 'O', 'Ｐ' : 'P', 'Ｑ' : 'Q', 'Ｒ' : 'R', 'Ｓ' : 'S', 'Ｔ' : 'T', 'Ｕ' : 'U',
            'Ｖ' : 'V', 'Ｗ' : 'W', 'Ｘ' : 'X', 'Ｙ' : 'Y', 'Ｚ' : 'Z',
            'ａ' : 'a', 'ｂ' : 'b', 'ｃ' : 'c', 'ｄ' : 'd', 'ｅ' : 'e', 'ｆ' : 'f', 'ｇ' : 'g',
            'ｈ' : 'h', 'ｉ' : 'i', 'ｊ' : 'j', 'ｋ' : 'k', 'ｌ' : 'l', 'ｍ' : 'm', 'ｎ' : 'n',
            'ｏ' : 'o', 'ｐ' : 'p', 'ｑ' : 'q', 'ｒ' : 'r', 'ｓ' : 's', 'ｔ' : 't', 'ｕ' : 'u',
            'ｖ' : 'v', 'ｗ' : 'w', 'ｘ' : 'x', 'ｙ' : 'y', 'ｚ' : 'z',
        };

        let objs: { [key: string]: string } = {};
        Object.assign(objs, num);
        Object.assign(objs, kana);
        Object.assign(objs, alpha);

        let sql = columnNameOrValue;
        Object.keys(objs).forEach(key => sql = `TRANSLATE(${sql} ,'${key}','${objs[key]}')`);

        return sql;
    }
}