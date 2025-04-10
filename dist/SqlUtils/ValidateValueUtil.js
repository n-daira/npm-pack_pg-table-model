"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DateTimeUtil_1 = __importDefault(require("../Utils/DateTimeUtil"));
const StringUtil_1 = __importDefault(require("../Utils/StringUtil"));
class ValidateValueUtil {
    static validateId(columns, id) {
        if ('id' in columns === false) {
            throw new Error("idがColumnsに設定されていません。");
        }
        const column = columns['id'];
        if (column.attribute !== 'primary') {
            throw new Error("idはPrimary Keyとして設定されていません。");
        }
        ValidateValueUtil.validateValue(column, id);
    }
    static validateValue(column, value) {
        if (value === undefined) {
            throw new Error(`valueはundefinedです。`);
        }
        if (value === null) {
            if (column.attribute === 'nullable') {
                return null;
            }
            throw new Error(`指定したColumnはNull許容していません。(${column.attribute})`);
        }
        switch (column.type) {
            case "string":
                if (this.isErrorString(value)) {
                    throw new Error('stringまたはnumber型で入力してください');
                }
                break;
            case "uuid":
                if (this.isErrorUUID(value)) {
                    throw new Error('stringのUUID形式で入力してください。');
                }
                break;
            case "date":
                if (this.isErrorDate(value)) {
                    throw new Error('"YYYY-MM-DD" or "YYYY-MM-DD hh:mi:ss"形式 or Date型かつ有効な日時で入力してください。');
                }
                break;
            case "time":
                if (this.isErrorTime(value)) {
                    throw new Error('"hh:mi"形式または"hh:mi:ss"形式かつ有効な時間で入力してください。');
                }
                break;
            case "timestamp":
                if (this.isErrorTimestamp(value)) {
                    throw new Error('"YYYY-MM-DD"形式または"YYYY-MM-DD hh:mi:ss"形式または"YYYY-MM-DDThh:mi:ss"形式またはDate型かつ有効な日時で入力してください。');
                }
                break;
            case "number":
                if (this.isErrorNumber(value)) {
                    throw new Error('number型または半角数字の文字列で入力してください。');
                }
                break;
            case "bool":
                if (this.isErrorBool(value)) {
                    throw new Error('bool型または"true","false"のstring型または0,1のnumber型のいずれかで入力してください。');
                }
                break;
            default:
                throw new Error(`指定したカラムタイプは存在しません。(${column.type})`);
        }
    }
    static isErrorValue(columnType, value) {
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
    static isErrorString(value) {
        if (typeof (value) == 'string' || typeof (value) == 'number') {
            return false;
        }
        return true;
    }
    static isErrorNumber(value) {
        if (typeof value === 'string') {
            if (value.trim() === "" || isNaN(Number(value))) {
                return true;
            }
            return false;
        }
        else if (typeof value === 'number') {
            return false;
        }
        return true;
    }
    static isErrorBool(value) {
        switch (typeof (value)) {
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
    static isErrorUUID(value) {
        return StringUtil_1.default.isUUID(value) === false;
    }
    static isErrorDate(value) {
        if (value instanceof Date) {
            return false;
        }
        else if (DateTimeUtil_1.default.isYYYYMMDD(value)) {
            return false;
        }
        else if (DateTimeUtil_1.default.isYYYYMMDDhhmiss(value)) {
            return false;
        }
        return true;
    }
    static isErrorTimestamp(value) {
        if (value instanceof Date) {
            return false;
        }
        else if (DateTimeUtil_1.default.isYYYYMMDD(`${value}`)) {
            return false;
        }
        else if (DateTimeUtil_1.default.isYYYYMMDDhhmiss(value)) {
            return false;
        }
        return true;
    }
    static isErrorTime(value) {
        if (value instanceof Date) {
            return false;
        }
        if (DateTimeUtil_1.default.isHHMMSS(value)) {
            return false;
        }
        else if (DateTimeUtil_1.default.isHHMM(value)) {
            return false;
        }
        return true;
    }
}
exports.default = ValidateValueUtil;
