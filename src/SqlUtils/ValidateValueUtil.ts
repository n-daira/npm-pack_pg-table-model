import { TColumn, TColumnType } from "../Type";
import DateTimeUtil from "../Utils/DateTimeUtil";
import StringUtil from "../Utils/StringUtil";

export default class ValidateValueUtil {
    
    static validateId(columns: {[key: string]: TColumn}, id: any) {
        if ('id' in columns === false) {
            throw new Error("The 'id' is not set in Columns.");
        }

        const pkColumnsArray = Object.entries(columns).filter(([key, column]) => column.attribute === 'primary');
        const pkColumns = Object.fromEntries(pkColumnsArray);
        if ('id' in pkColumns === false) {
            throw new Error("The 'id' is not set as a Primary Key.");
        }

        if (Object.keys(pkColumns).length > 1) {
            throw new Error("This method cannot be used because there are other Primary Keys set besides 'id'.");
        }
        

        ValidateValueUtil.validateValue(pkColumns['id'], id);
    }

    static validateValue(column: TColumn, value: any) {
        if (value === undefined) {
            throw new Error(`The value is undefined.`);
        }

        if (value === null) {
            if (column.attribute === 'nullable') {
                return null;
            }

            throw new Error(`The specified column does not allow null values. (${column.attribute})`);
        }

        switch (column.type) {
            case "string":
                if (this.isErrorString(value)) {
                    throw new Error('Please enter a value of type string or number.');
                }
                break;
            case "uuid":
                if (this.isErrorUUID(value)) {
                    throw new Error('Please enter a value in UUID string format.');
                }
                break;
            case "date":
                if (this.isErrorDate(value)) {
                    throw new Error('Please enter a valid date in "YYYY-MM-DD" or "YYYY-MM-DD hh:mi:ss" format or as a Date type.');
                }
                break;
            case "time":
                if (this.isErrorTime(value)) {
                    throw new Error('Please enter a valid time in "hh:mi" or "hh:mi:ss" format.');
                }
                break;
            case "timestamp":
                if (this.isErrorTimestamp(value)) {
                    throw new Error('Please enter a valid timestamp in "YYYY-MM-DD", "YYYY-MM-DD hh:mi:ss", or "YYYY-MM-DDThh:mi:ss" format or as a Date type.');
                }
                break;
            case "number":
                if (this.isErrorNumber(value)) {
                    throw new Error('Please enter a value of type number or a string of half-width digits.');
                }
                break;
            case "bool":
                if (this.isErrorBool(value)) {
                    throw new Error('Please enter a value of type bool, or a string "true" or "false", or a number 0 or 1.');
                }
                break;
            default:
                throw new Error(`The specified column type does not exist. (${column.type})`);
        }
    }

    static isErrorValue(columnType: TColumnType, value: any) {
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
                throw new Error(`The specified ColumnTypeEnum does not exist. (${columnType})`);
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