import { TableModel } from "./TableModel";
import { TOption, TSqlValue } from "./Type";

type TError = {code?: string; message?: string;};

export default class ValidateClient {
    private model: TableModel;
    constructor(model: TableModel) {
        this.model = model;
    }
    
    public tryDate(value: any, isExcludeTime: boolean = false): Date | false {
        if (value instanceof Date) {
            return value;
        } else if (typeof value !== 'string') {
            return false;
        }

        try {
            const [datePart, timePart] = value.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            let [hours, minutes, seconds] = [0, 0, 0];
            if (timePart !== undefined) {
                [hours, minutes, seconds] = timePart.split(':').map(Number);
            }

            // 日付の整合性チェック
            const date = new Date(year, month - 1, day, hours, minutes, seconds);
            if (date.getFullYear() !== year || 
                date.getMonth() + 1 !== month || 
                date.getDate() !== day ||
                date.getHours() !== hours ||
                date.getMinutes() !== minutes ||
                date.getSeconds() !== seconds
            ) {
                return false;
            }
            
            return date;
        } catch (ex) {
            return false;
        }
    }

    public validateInList(option: TOption, key: string, list: Array<TSqlValue>, error?: TError) {
        const column = this.model.getColumn(key);
        const value = option[key];
        
        if (list.includes(value) === false) {
            const code = error?.code ?? "000";
            let message = error?.message;
            if (message === undefined) {
                message = `{column} must be one of the items in the {list}. ({value})`;
            }
            message = message.replace('{column}', column.alias ?? column.columnName);
            message = message.replace('{value}', column.alias ?? column.columnName);
            message = message.replace('{list}', list.join(', '));
            this.model.throwValidationError(code, message);
        }
    }

    public validateOverNow(option: TOption, key: string, error?: TError) {
        const column = this.model.getColumn(key);

        const date = this.tryDate(option[key]);
        if (date === false) {
            throw new Error("The value must be a Date or a valid date string  when using validateOverNow.");
        }

        const now = new Date();
        if (date > now) {
            const code = error?.code ?? "000";
            let message = error?.message;
            if (message === undefined) {
                message = `{column} should be entered on or before now. ({value})`;
            }
            message = message.replace('{column}', column.alias ?? column.columnName);
            message = message.replace('{value}', column.alias ?? column.columnName);
            this.model.throwValidationError(code, message);
        }
    }

    public validateOverToday(option: TOption, key: string, isErrorToday: boolean, error?: TError): void {
        const column = this.model.getColumn(key);

        const date = this.tryDate(option[key]);
        if (date === false) {
            throw new Error("The value must be a Date or a valid date string when using vaildateOverToday.");
        }

        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        const today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(isErrorToday ? 0 : 1);

        if (date >= today) {
            const code = error?.code ?? "000";
            let message = error?.message;
            if (message === undefined) {
                if (isErrorToday) {
                    message = `{column} should be entered before today. ({value})`;
                } else {
                    message = `{column} should be entered on or before today. ({value})`;
                }
            }
            message = message.replace('{column}', column.alias ?? column.columnName);
            message = message.replace('{value}', column.alias ?? column.columnName);
            this.model.throwValidationError(code, message);
        }
    }

    public validateStringRegExp(option: TOption, key: string, regExp: RegExp | string, error?: TError): void {
        const column = this.model.getColumn(key);
        const value = option[key];
        if (typeof value !== 'string') {
            throw new Error("The value must be a string when using validateStringRegExp.");
        }

        if (typeof regExp === 'string') {
            regExp = new RegExp(regExp);
        }

        if (regExp.test(value) === false) {
            const code = error?.code ?? "000";
            let message = error?.message;
            if (message === undefined) {
                message = `{column} is invalid. ({value})`;
            }
            message = message.replace('{column}', column.alias ?? column.columnName);
            message = message.replace('{value}', column.alias ?? column.columnName);
            this.model.throwValidationError(code, message);
        }
    }
}