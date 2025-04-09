export default class DateTimeUtil {

    /**
     * Checks if the value is a valid date-time format
     * 値が有効な日付時間形式かどうかを確認します
     * @param value - 検証する値, The value to be validated
     * @returns {boolean} - 値が有効な日付時間形式であるかどうか, Whether the value is a valid date-time format
     */
    static isErrorDateTime(value: string): boolean {
        try {
            const [datePart, timePart] = value.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            let [hour, minute, sec] = [0, 0, 0];
            if (timePart !== undefined) {
                [hour, minute, sec] = timePart.split(':').map(Number);
            }
            
            const date = new Date(year, month - 1, day, hour, minute, sec);
            return year !== date.getFullYear() || 
                   month !== date.getMonth() + 1 || 
                   day !== date.getDate() ||
                   hour !== date.getHours() ||
                   minute !== date.getMinutes() ||
                   sec !== date.getSeconds()
        } catch (error) {
            return true;
        }
    }

    /**
     * Generates a Date object from a string.
     * 文字列からDateオブジェクトを生成します。
     * @param dateString A string representing the date and time (e.g., "2023-10-05 14:30:00")
     * 日付と時間を表す文字列（例: "2023-10-05 14:30:00"）
     * @returns Date object
     * Dateオブジェクト
     */
    static toDateFromString(dateString: string): Date {
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        let [hours, minutes, seconds] = [0, 0, 0];
        if (timePart !== undefined) {
            [hours, minutes, seconds] = timePart.split(':').map(Number);
        }
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    /**
     * Formats the specified date.
     * 指定された日付をフォーマットします。
     * @param date The date object to be formatted.
     * フォーマットする対象の日付オブジェクト
     * @param type A string specifying the type of format.
     * フォーマットの種類を指定する文字列
     * @returns A formatted date string.
     * フォーマットされた日付文字列
     */
    static toStringFromDate(date: Date, type: 'datetime' | 'date' | 'time'): string {

        const year = date.getFullYear().toString().padStart(4, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const second = date.getSeconds().toString().padStart(2, '0');

        switch (type) {
            case 'datetime':
                return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
            case 'date':
                return `${year}-${month}-${day}`;
            case 'time':
                return `${hour}:${minute}:${second}`;
            default:
                throw new Error('Invalid type');
        }
    }

    /**
     * Validates if the given value is in the format YYYY-MM-DD
     * 与えられた値がYYYY-MM-DD形式であるかどうかを検証します
     * @param value - The value to be validated, 検証する値
     * @returns {boolean} - Whether the value is in the format YYYY-MM-DD, 値がYYYY-MM-DD形式であるかどうか
     */
    static isYYYYMMDD(value: any) {
        if (typeof value !== 'string') {
            return false;
        }

        const pattern = new RegExp('^\\d{4}-\\d{2}-\\d{2}$');
        return pattern.test(value);
    }

    /**
     * Validates if the given value is in the format YYYY-MM-DD hh:mm:ss
     * 与えられた値がYYYY-MM-DD hh:mm:ss形式であるかどうかを検証します
     * @param value - The value to be validated, 検証する値
     * @returns {boolean} - Whether the value is in the format YYYY-MM-DD hh:mm:ss, 値がYYYY-MM-DD hh:mm:ss形式であるかどうか
     */
    static isYYYYMMDDhhmiss(value: any) {
        if (typeof value !== 'string') {
            return false;
        }

        const pattern = new RegExp('^\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}:\\d{2}$');
        return pattern.test(value);
    }

    /**
     * Validates if the given value is in the format YYYY-MM-DD hh:mm:ss
     * 与えられた値がYYYY-MM-DD hh:mm:ss形式であるかどうかを検証します
     * @param value - The value to be validated, 検証する値
     * @returns {boolean} - Whether the value is in the format YYYY-MM-DD hh:mm:ss, 値がYYYY-MM-DD hh:mm:ss形式であるかどうか
     */
    static isHHMM(value: any) {
        if (typeof value !== 'string') {
            return false;
        }

        const pattern = new RegExp('^(?:[01]\\d|2[0-3]):[0-5]\\d$');
        return pattern.test(value);
    }

    /**
     * Validates if the given value is in the format HH:MM:SS
     * 与えられた値がHH:MM:SS形式であるかどうかを検証します
     * @param value - The value to be validated, 検証する値
     * @returns {boolean} - Whether the value is in the format HH:MM:SS, 値がHH:MM:SS形式であるかどうか
     */
    static isHHMMSS(value: any) {
        if (typeof value !== 'string') {
            return false;
        }

        const pattern = new RegExp('^(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$');
        return pattern.test(value);
    }
}