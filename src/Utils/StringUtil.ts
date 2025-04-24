export default class StringUtil {
    /**
     * Validates if the given value is a valid UUID
     * 与えられた値が有効なUUIDであるかどうかを検証します
     * @param value - The value to be validated, 検証する値
     * @returns {boolean} - Whether the value is a valid UUID, 値が有効なUUIDであるかどうか
     */
    static isUUID(value: any) {
        if (typeof value !== 'string') {
            return false;
        }

        const pattern = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
        return pattern.test(value);
    }

    /**
     * 小文字スネークからキャピタルケースに変換
     * @param {string} value スネーク文字列
     * @returns キャピタル文字列
     */
    static formatFromSnakeToCamel(value: string) {
        const regex = /_[a-z]/g;
        let capital = value.replace(regex,
            function(matchChar) {
                return String.fromCharCode(matchChar.charCodeAt(1) - 0x20);
            }
        );
    
        // "_1"や"_@"のパターンを考慮して、_を省く（この使い方はあまりないと思いますが...）
        return capital.replaceAll("_", "");
    }
}