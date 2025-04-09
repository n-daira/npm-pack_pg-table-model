"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DateTimeUtil_1 = __importDefault(require("./DateTimeUtil"));
const StringUtil_1 = __importDefault(require("./StringUtil"));
class ValidateValueUtil {
    static isErrorValue(columnType, value) {
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
