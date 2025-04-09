"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionType = void 0;
const BaseColumnType_1 = __importDefault(require("./BaseColumnType"));
const DateTimeUtil_1 = __importDefault(require("./Utils/DateTimeUtil"));
const NumberUtil_1 = __importDefault(require("./Utils/NumberUtil"));
const StringUtil_1 = __importDefault(require("./Utils/StringUtil"));
class OptionType {
    constructor() {
        this.excludeParam = [
            'excludeParam', 'columns'
        ];
        this.columns = new BaseColumnType_1.default();
    }
    /**
     * 入力エラー例外をスローします。
     * @param key プロパティのキー
     * @param value 設定する値
     * @param codeId エラーコードのID
     * @param message エラーメッセージ
     */
    throwInputErrorException(key, value, codeId, message) {
        const snakeKey = StringUtil_1.default.formatFromCamelToSnake(key);
        const column = this.columns.toObject[snakeKey];
        const errorLog = `columnn : ${snakeKey}, value : ${value}`;
        throw new Error(`${message}(${errorLog})`);
    }
    get Columns() { return this.columns; }
    /**
     * 値を設定する際のバリデーションを行います。
     * @param key 設定するプロパティのキー
     * @param value 設定する値
     */
    setValue(key, value) {
        const column = this.Columns.toObject[key];
        if (column === undefined) {
            throw new Error(`指定されたキーはカラムに存在しません table : ${this.tableName}, columnn : ${key}`);
        }
        if (key in this == false) {
            throw new Error(`指定されたキーはモデルに存在しません table : ${this.tableName}, columnn : ${key}`);
        }
        if (value === undefined) {
            return;
        }
        if (value === null || (typeof value === 'string' && value.trim() === '')) {
            if (column.Attribute === ColumnAttributeEnum.Nullable) {
                this.setProperty(key, null);
                return;
            }
            this.throwInputErrorException(key, value, "N1", `NULL許容されていないカラム。：${key}`);
        }
        switch (column.Type) {
            case ColumnTypeEnum.String:
                if (typeof value != 'string') {
                    this.throwInputErrorException(key, value, "S1", `${column.Name}は文字列で入力してください。`);
                }
                if (value.length > column.Length) {
                    this.throwInputErrorException(key, value, "S2", `${column.Name}は${column.Length}文字以内で入力してください。`);
                }
                this.setValue(key, value);
                return;
            case ColumnTypeEnum.UUID:
                if (StringUtil_1.default.isUUID(value) === false) {
                    this.throwInputErrorException(key, value, "U1", `${column.Name}はUUIDで入力してください。`);
                }
                this.setValue(key, value);
                return;
            case ColumnTypeEnum.Number:
                if (NumberUtil_1.default.isNumber(value) == false) {
                    this.throwInputErrorException(key, value, "N1", `${column.Name}は数値で入力してください。`);
                }
                this.setValue(key, Number(value));
                return;
            case ColumnTypeEnum.Bool:
                switch (typeof (value)) {
                    case 'string':
                        if (value !== 'true' && value !== 'false') {
                            this.throwInputErrorException(key, value, "B1", `${column.Name}はtrue or falseで入力してください。`);
                        }
                        this.setValue(key, value === 'true');
                        return;
                    case 'number':
                        if (value != 1 && value != 0) {
                            this.throwInputErrorException(key, value, "B2", `${column.Name}は0 or 1で入力してください。`);
                        }
                        this.setValue(key, value === 1);
                        return;
                    case 'boolean':
                        this.setValue(key, value);
                        return;
                    default:
                        this.throwInputErrorException(key, value, "B3", `${column.Name}はboolで入力してください。`);
                }
            case ColumnTypeEnum.Date:
                if (value instanceof Date == false) {
                    this.setValue(key, value);
                    return;
                }
                if (typeof value === 'string') {
                    if (DateTimeUtil_1.default.isYYYYMMDD(value)) {
                        this.setValue(key, DateTimeUtil_1.default.toDateFromString(value));
                        return;
                    }
                    if (DateTimeUtil_1.default.isYYYYMMDDhhmiss(value)) {
                        const split = value.split(' ');
                        this.setValue(key, DateTimeUtil_1.default.toDateFromString(`${split[0]} 00:00:00`));
                        return;
                    }
                }
                this.throwInputErrorException(key, value, "D1", `${column.Name}は"YYYY-MM-DD" or "YYYY-MM-DD hh:mi:ss"形式 or Date型で入力してください。`);
            case ColumnTypeEnum.Time:
                if (DateTimeUtil_1.default.isHHMM(value)) {
                    return value + ':00';
                }
                else if (DateTimeUtil_1.default.isHHMMSS(value)) {
                    return value;
                }
                this.throwInputErrorException(key, value, "D2", `${column.Name}は"hh:mi"形式または"hh:mi:ss"形式で入力してください。`);
            case ColumnTypeEnum.Timestamp:
                if (value instanceof Date == false) {
                    this.setValue(key, value);
                    return;
                }
                if (typeof (value) == 'string') {
                    if (DateTimeUtil_1.default.isYYYYMMDD(value)) {
                        this.setValue(key, DateTimeUtil_1.default.toDateFromString(`${value} 00:00:00`));
                        return;
                    }
                    if (DateTimeUtil_1.default.isYYYYMMDDhhmiss(value)) {
                        this.setValue(key, DateTimeUtil_1.default.toDateFromString(value));
                        return;
                    }
                }
                this.throwInputErrorException(key, value, "T1", `${column.Name}は"YYYY-MM-DD"形式または"YYYY-MM-DD hh:mi:ss"形式または"YYYY-MM-DDThh:mi:ss"形式またはDate型で入力してください。`);
        }
    }
    get toObject() {
        const obj = {};
        for (const key of Object.keys(this)) {
            if (this.excludeParam.includes(key)) {
                continue;
            }
            const value = this[key];
            if (value === undefined) {
                continue;
            }
            obj[key] = value;
        }
        return obj;
    }
    /**
     * 指定されたキーに対してプロパティを設定します。
     * 必要に応じて、プロパティの値を検証するメソッドを呼び出します。
     *
     * @param key 設定するプロパティのキー
     * @param value 設定する値
     */
    setProperty(key, value) {
        this[key] = value;
        const validateMethodName = `validate${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (typeof this[validateMethodName] === 'function') {
            this[validateMethodName]();
        }
        const convertMethodNname = `convert${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (typeof this[convertMethodNname] === 'function') {
            this[convertMethodNname]();
        }
    }
}
exports.OptionType = OptionType;
