import { TColumnType } from "../Type";
import DateTimeUtil from "./DateTimeUtil";
import StringUtil from "./StringUtil";

export default class ValidateValueUtil {
    
    static isErrorValue(columnType: TColumnType, value: any) {

        if (value === null) {
            return 'null';
        }

        switch (columnType) {
            case "string":
                return this.isErrorString(value);
            case "uuid":
                return this.isErrorUUID(value);
            case "date":
                return this.isErrorDate(value);
            case "time":
                return this.isErrorTime(value);
            case "timestamp":
                return this.isErrorTimestamp(value);
            case "number":
                return this.isErrorNumber(value);
            case "bool":
                return this.isErrorBool(value);
            default:
                throw new Error(`指定したColumnTypeEnumは存在しません。(${columnType})`);
        }
    }

    static isErrorString(value: any): boolean {
        if (typeof(value) == 'string' || typeof(value) == 'number') {
            return false;
        }
        return true;
    }

    static isErrorNumber(value: any): boolean {
        if (typeof value === 'string') {
            if (value.trim() === "" || isNaN(Number(value))) {
                return true;
            }
            return false;
        } else if (typeof value === 'number') {
            return false;
        }

        return true;
    }

    static isErrorBool(value: any): boolean {
        switch (typeof(value)) {
            case 'string':
                return value !== 'true' && value !== 'false';
            case 'number':
                return value !== 0 && value !== 1;
            case 'boolean':
                return false;
            default:
                return true;
        }
    }

    static isErrorUUID(value: any) {
        return StringUtil.isUUID(value) === false;
    }

    static isErrorDate(value: any): boolean {
        if (value instanceof Date) {
            return false;
        } else if (DateTimeUtil.isYYYYMMDD(value)) {
            return false;
        } else if (DateTimeUtil.isYYYYMMDDhhmiss(value)) {
            return false;
        }

        return true;
    }

    static isErrorTimestamp(value: any): boolean {
        if (value instanceof Date) {
            return false
        } else if (DateTimeUtil.isYYYYMMDD(`${value}`)) {
            return false;
        } else if (DateTimeUtil.isYYYYMMDDhhmiss(value)) {
            return false;
        }

        return true;
    }

    static isErrorTime(value: any): boolean {
        if (value instanceof Date) {
            return false
        }
        if (DateTimeUtil.isHHMMSS(value)) {
            return false;
        } else if (DateTimeUtil.isHHMM(value)) {
            return false;
        }

        return true;
    }
}