import { ColumnTypeEnum } from "../EnumType";
import DateTimeUtil from "./DateTimeUtil";
import StringUtil from "./StringUtil";

export default class ToValueUtil {

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
    static toValue(columnType: ColumnTypeEnum, value: any) {

        if (value === null) {
            return 'null';
        }

        switch (columnType) {
            case ColumnTypeEnum.String:
                return this.toString(value);
            case ColumnTypeEnum.UUID:
                return this.toUUID(value);
            case ColumnTypeEnum.Date:
                return this.toDate(value);
            case ColumnTypeEnum.Time:
                return this.toTime(value);
            case ColumnTypeEnum.Timestamp:
                return this.toDateTime(value);
            case ColumnTypeEnum.Number:
                return this.toNumber(value);
            case ColumnTypeEnum.Bool:
                return this.toBool(value);
            default:
                throw new Error(`指定したColumnTypeEnumは存在しません。(${columnType})`);
        }
    }
    
    /**
     * Converts the specified value to a string format.
     * 指定された値を文字列形式に変換します。
     * @param value The value to be converted.
     * 変換する値。
     * @returns A string representation of the value.
     * 値の文字列表現。
     */
    static toString(value: any) {
        if (typeof(value) == 'string' || typeof(value) == 'number') {
            return `'${value}'`;
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
    static toNumber(value: any) {
        if (typeof value === 'string') {
            if (value.trim() === "" || isNaN(Number(value))) {
                throw new Error(`${value}は数値で入力してください。`);
            }
            return value;
        } else if (typeof value === 'number') {
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
    static toBool(value: any) {
        switch (typeof(value)) {
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
    static toUUID(value: any) {
        if (typeof(value) == 'string' && StringUtil.isUUID(value)) {
            return "'" + value + "'";
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
    static toDate(value: any) {
        if (typeof value === 'string') {
            if (DateTimeUtil.isYYYYMMDD(value) === false) {
                throw new Error(`${value}はyyyy-mm-dd形式の文字列ではありません。`);
            }

            if (DateTimeUtil.isErrorDateTime(`${value}`)) {
                throw new Error(`${value}は日付に変換できませんでした。`);
            }

            return `'${value}'`;
        } else if (value instanceof Date) {
            return `'${DateTimeUtil.toStringFromDate(value, 'date')}'`;
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
    static toDateTime(value: any) {

        if (typeof value === 'string') {
            let datetime = '';
            if (DateTimeUtil.isYYYYMMDD(`${value}`)) {
                datetime = `${value} 00:00:00`;
            } else if (DateTimeUtil.isYYYYMMDDhhmiss(value)) {
                datetime = `${value.replace("T", " ")}`;
            } else {
                throw new Error(`${value}はyyyy-mm-dd またはyyyy-mm-dd hh:mmi:ss形式の文字列ではありません。`);
            }
            
            if (DateTimeUtil.isErrorDateTime(`${value}`)) {
                throw new Error(`${value}は日付に変換できませんでした。`);
            }

            return `'${value}'`;
            
        } else if (value instanceof Date) {
            return `'${DateTimeUtil.toStringFromDate(value, 'datetime')}'`;
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
    static toTime(value: any) {

        if (typeof value === 'string') {
            if (DateTimeUtil.isHHMMSS(value)) {
                return `'${value}'`;
            } else if (DateTimeUtil.isHHMM(value)) {
                return `'${value}:00'`;
            }

            throw new Error("Timeはhh:miまたはhh:mi:ssの文字列で入力してください。");
        } else if (value instanceof Date) {
            return `'${DateTimeUtil.toStringFromDate(value, 'time')}'`;
        }

        throw new Error(`${value}はhh:mi または hh:mi:ss形式の文字列、またはDate型で入力してください。`);
    }
}