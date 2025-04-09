"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertHelper = void 0;
const BaseTableModel_1 = require("./BaseTableModel");
class InsertHelper extends BaseTableModel_1.BaseTableModel {
    /**
     * Performs validation checks during INSERT.
     * INSERT時のバリデーションチェックを行う
     * @param values The values to be inserted.
     * 挿入する値
     * @param connection The database connection.
     * データベース接続
     */
    validateInsert(options) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const columnKey in this.Columns) {
                const column = this.Columns[columnKey];
                if (options[columnKey] === undefined || options[columnKey] === null) {
                    // Null許容されていないカラムにNULLを入れようとしているか？
                    if (column.attribute === "primary" || column.attribute === "noDefault") {
                        this.throwValidationError(`${column.name}を入力してください。`);
                    }
                }
            }
        });
    }
    /**
     * Executes an insert operation with the provided options.
     * 指定されたオプションで��入操作を実行します。
     * @param options The options for the insert operation.
     * ��入操作のオプション。
     */
    executeInsert(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateOptions(options);
            yield this.validateInsert(options);
            const insertColumns = [];
            const insertValues = [];
            const insertVar = [];
            for (const [key, value] of Object.entries(options)) {
                if (value === undefined || value === null) {
                    continue;
                }
                insertColumns.push(key);
                insertValues.push(value);
                insertVar.push(`$${insertVar.length + 1}`);
            }
            let sql = `INSERT INTO ${this.TableName} (${insertColumns.join(",")}) VALUES (${insertVar.join(",")});`;
            yield this.executeQuery(sql, insertValues);
        });
    }
}
exports.InsertHelper = InsertHelper;
