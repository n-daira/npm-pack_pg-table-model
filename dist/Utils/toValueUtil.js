"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DateTimeUtil_1 = __importDefault(require("./DateTimeUtil"));
const StringUtil_1 = __importDefault(require("./StringUtil"));
class ToValueUtil {
    /**
     * Converts the specified value to the appropriate format based on the column type.
     * 指定された値をカラムタイプに基づいて適切な形式に変換します。
     * @param columnType The type of the column.
     * カラムのタイプ。
     * @param value The value to be converted.
     * 変換する値。
     * @returns The converted value.
     * 変換された値。
     */
    // static toValue(column: TColumn, value: any) {
    //     if (value === null) {
    //         if (column.attribute === 'nullable') {
    //             return null;
    //         }
    //         throw new Error(`指定したColumnはNull許容していません。(${column.attribute})`);
    //     }
    //     switch (column.type) {
    //         case "string":
    //             return this.toString(value);
    //         case "uuid":
    //             return this.toUUID(value);
    //         case "date":
    //             return this.toDate(value);
    //         case "time":
    //             return this.toTime(value);
    //         case "timestamp":
    //             return this.toDateTime(value);
    //         case "number":
    //             return this.toNumber(value);
    //         case "bool":
    //             return this.toBool(value);
    //         default:
    //             throw new Error(`指定したColumnTypeEnumは存在しません。(${column.type})`);
    //     }
    // }
    /**
     * Converts the specified value to a string format.
     * 指定された値を文字列形式に変換します。
     * @param value The value to be converted.
     * 変換する値。
     * @returns A string representation of the value.
     * 値の文字列表現。
     */
    static toString(value) {
        if (typeof (value) == 'string' || typeof (value) == 'number') {
            return `${value}`;
        }
        throw new Error("文字列を入力してください。");
    }
    /**
     * Converts the specified value to a number format.
     * 指定された値を数値形式に変換します。
     * @param value The value to be converted.
     * 変換する値。
     * @returns A string representation of the number.
     * 数値の文字列表現。
     */
    static toNumber(value) {
        if (typeof value === 'string') {
            if (value.trim() === "" || isNaN(Number(value))) {
                throw new Error(`${value}は数値で入力してください。`);
            }
            return value;
        }
        else if (typeof value === 'number') {
            return value.toString();
        }
        throw new Error(`${value}は数値で入力してください。`);
    }
    /**
     * Converts the specified value to a boolean format.
     * 指定された値をブール形式に変換します。
     * @param value The value to be converted.
     * 変換する値。
     * @returns A string representation of the boolean value.
     * ブール値の文字列表現。
     */
    static toBool(value) {
        switch (typeof (value)) {
            case 'string':
                if (value != 'true' && value != 'false') {
                    throw new Error(`${value}はtrue or falseの文字列で入力してください。`);
                }
                return value;
            case 'number':
                if (value !== 0 && value !== 1) {
                    throw new Error(`${value}は1 or 0の数値で入力してください。`);
                }
                return value == 1 ? 'true' : 'false';
            case 'boolean':
                return value ? 'true' : 'false';
            default:
                throw new Error(`${value}はtrue or falseの文字列、1 or 0の数値、bool型のいずれかで入力してください。`);
        }
    }
    /**
     * Converts the specified value to a UUID format.
     * 指定された値をUUID形式に変換します。
     * @param value The value to be converted.
     * 変換する値。
     * @returns A string representation of the UUID.
     * UUIDの文字列表現。
     */
    static toUUID(value) {
        if (StringUtil_1.default.isUUID(value)) {
            return value;
        }
        throw new Error("UUIDのフォーマットエラーです。");
    }
    /**
     * Converts the specified value to SQL date format.
     * 指定された値をSQLの日付形式に変換します。
     * @param value The value to be converted. A string or Date type.
     * 変換する値。文字列またはDate型。
     * @returns A string in SQL date format.
     * SQLの日付形式の文字列。
     * @throws SqlException If the specified value is invalid.
     * 指定された値が無効な場合。
     */
    static toDate(value) {
        if (value instanceof Date) {
            return `${DateTimeUtil_1.default.toStringFromDate(value, 'date')}`;
        }
        else if (DateTimeUtil_1.default.isYYYYMMDD(value)) {
            return `${value}`;
        }
        else if (DateTimeUtil_1.default.isYYYYMMDDhhmiss(value)) {
            const split = value.replace('T', ' ').split(' ');
            return `${split[0]}`;
        }
        throw new Error(`${value}はyyyy-mm-ddの文字列、またはDate型で入力してください。`);
    }
    /**
     * Converts the specified value to SQL datetime format.
     * 指定された値をSQLの日時形式に変換します。
     * @param value The value to be converted. A string or Date type.
     * 変換する値。文字列またはDate型。
     * @returns A string in SQL datetime format.
     * SQLの日時形式の文字列。
     * @throws SqlException If the specified value is invalid.
     * 指定された値が無効な場合。
     */
    static toDateTime(value) {
        if (value instanceof Date) {
            return `${DateTimeUtil_1.default.toStringFromDate(value, 'datetime')}`;
        }
        if (DateTimeUtil_1.default.isYYYYMMDD(`${value}`)) {
            return `${value} 00:00:00`;
        }
        else if (DateTimeUtil_1.default.isYYYYMMDDhhmiss(value)) {
            return `${value.replace('T', ' ')}`;
        }
        throw new Error(`${value}はyyyy-mm-dd またはyyyy-mm-dd hh:mi:ss形式の文字列、またはDate型で入力してください。`);
    }
    /**
     * Converts the specified value to SQL time format.
     * 指定された値をSQLの時間形式に変換します。
     * @param value The value to be converted. A string or Date type.
     * 変換する値。文字列またはDate型。
     * @returns A string in SQL time format.
     * SQLの時間形式の文字列。
     * @throws SqlException If the specified value is invalid.
     * 指定された値が無効な場合。
     */
    static toTime(value) {
        if (typeof value === 'string') {
            if (DateTimeUtil_1.default.isHHMMSS(value)) {
                return `${value}`;
            }
            else if (DateTimeUtil_1.default.isHHMM(value)) {
                return `${value}:00`;
            }
            throw new Error("Timeはhh:miまたはhh:mi:ssの文字列で入力してください。");
        }
        else if (value instanceof Date) {
            return `${DateTimeUtil_1.default.toStringFromDate(value, 'time')}`;
        }
        throw new Error(`${value}はhh:mi または hh:mi:ss形式の文字列、またはDate型で入力してください。`);
    }
}
exports.default = ToValueUtil;
