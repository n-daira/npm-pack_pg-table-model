"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidateClient {
    constructor(model) {
        this.model = model;
    }
    tryDate(value, isExcludeTime = false) {
        if (value instanceof Date) {
            return value;
        }
        else if (typeof value !== 'string') {
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
                date.getSeconds() !== seconds) {
                return false;
            }
            return date;
        }
        catch (ex) {
            return false;
        }
    }
    validateInList(option, key, list, error) {
        var _a, _b, _c;
        const column = this.model.getColumn(key);
        const value = option[key];
        if (list.includes(value) === false) {
            const code = (_a = error === null || error === void 0 ? void 0 : error.code) !== null && _a !== void 0 ? _a : "000";
            let message = error === null || error === void 0 ? void 0 : error.message;
            if (message === undefined) {
                message = `{column} must be one of the items in the {list}. ({value})`;
            }
            message = message.replace('{column}', (_b = column.alias) !== null && _b !== void 0 ? _b : column.columnName);
            message = message.replace('{value}', (_c = column.alias) !== null && _c !== void 0 ? _c : column.columnName);
            message = message.replace('{list}', list.join(', '));
            this.model.throwValidationError(code, message);
        }
    }
    validateOverNow(option, key, error) {
        var _a, _b, _c;
        const column = this.model.getColumn(key);
        const date = this.tryDate(option[key]);
        if (date === false) {
            throw new Error("The value must be a Date or a valid date string  when using validateOverNow.");
        }
        const now = new Date();
        if (date > now) {
            const code = (_a = error === null || error === void 0 ? void 0 : error.code) !== null && _a !== void 0 ? _a : "000";
            let message = error === null || error === void 0 ? void 0 : error.message;
            if (message === undefined) {
                message = `{column} should be entered on or before now. ({value})`;
            }
            message = message.replace('{column}', (_b = column.alias) !== null && _b !== void 0 ? _b : column.columnName);
            message = message.replace('{value}', (_c = column.alias) !== null && _c !== void 0 ? _c : column.columnName);
            this.model.throwValidationError(code, message);
        }
    }
    validateOverToday(option, key, isErrorToday, error) {
        var _a, _b, _c;
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
            const code = (_a = error === null || error === void 0 ? void 0 : error.code) !== null && _a !== void 0 ? _a : "000";
            let message = error === null || error === void 0 ? void 0 : error.message;
            if (message === undefined) {
                if (isErrorToday) {
                    message = `{column} should be entered before today. ({value})`;
                }
                else {
                    message = `{column} should be entered on or before today. ({value})`;
                }
            }
            message = message.replace('{column}', (_b = column.alias) !== null && _b !== void 0 ? _b : column.columnName);
            message = message.replace('{value}', (_c = column.alias) !== null && _c !== void 0 ? _c : column.columnName);
            this.model.throwValidationError(code, message);
        }
    }
    validateStringRegExp(option, key, regExp, error) {
        var _a, _b, _c;
        const column = this.model.getColumn(key);
        const value = option[key];
        if (typeof value !== 'string') {
            throw new Error("The value must be a string when using validateStringRegExp.");
        }
        if (typeof regExp === 'string') {
            regExp = new RegExp(regExp);
        }
        if (regExp.test(value) === false) {
            const code = (_a = error === null || error === void 0 ? void 0 : error.code) !== null && _a !== void 0 ? _a : "000";
            let message = error === null || error === void 0 ? void 0 : error.message;
            if (message === undefined) {
                message = `{column} is invalid. ({value})`;
            }
            message = message.replace('{column}', (_b = column.alias) !== null && _b !== void 0 ? _b : column.columnName);
            message = message.replace('{value}', (_c = column.alias) !== null && _c !== void 0 ? _c : column.columnName);
            this.model.throwValidationError(code, message);
        }
    }
}
exports.default = ValidateClient;
