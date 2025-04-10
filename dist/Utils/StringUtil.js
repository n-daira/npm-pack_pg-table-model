"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringUtil {
    // /**
    //  * Converts lowercase snake case to capital case.
    //  * 小文字スネークからキャピタルケースに変換
    //  * @param {string} value The snake case string.
    //  * スネーク文字列
    //  * @returns The capital case string.
    //  * キャピタル文字列
    //  */
    // static formatFromSnakeToCamel(value: string) {
    //     const regex = /_[a-z]/g;
    //     let capital = value.replace(regex,
    //         function(matchChar) {
    //             return String.fromCharCode(matchChar.charCodeAt(1) - 0x20);
    //         }
    //     );
    //     // "_1"や"_@"のパターンを考慮して、_を省く（この使い方はあまりないと思いますが...）
    //     return capital.replaceAll("_", "");
    // }
    // /**
    //  * Converts camel case to lowercase snake case.
    //  * キャメルケースから小文字スネークに変換
    //  * @param {string} value The camel case string.
    //  * キャメル文字列
    //  * @returns The snake case string.
    //  * スネーク文字列
    //  */
    // static formatFromCamelToSnake(value: string) {
    //     const regex = /[A-Z]/g;
    //     // 先頭が大文字の場合は小文字に変換
    //     if (value.length > 0 && value[0] === value[0].toUpperCase()) {
    //         value = value[0].toLowerCase() + value.slice(1);
    //     }
    //     return value.replace(regex,
    //         function(matchChar) {
    //         return "_" + String.fromCharCode(matchChar.charCodeAt(0) + 0x20);
    //         }
    //     );
    // }
    /**
     * Validates if the given value is a valid UUID
     * 与えられた値が有効なUUIDであるかどうかを検証します
     * @param value - The value to be validated, 検証する値
     * @returns {boolean} - Whether the value is a valid UUID, 値が有効なUUIDであるかどうか
     */
    static isUUID(value) {
        if (typeof value !== 'string') {
            return false;
        }
        const pattern = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
        return pattern.test(value);
    }
}
exports.default = StringUtil;
