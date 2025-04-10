export default class NumberUtil {
    /**
     * Checks if the given value is a number.
     * 与えられた値が数値であるかどうかを確認します。
     * @param value - The value to be checked. ���認する値。
     * @returns {boolean} - Whether the value is a number. ��が数値であるかどうか。
     */
    static isNumber(value: any) {
        if (value == null) {
            return false;
        } else if (value instanceof Date) { 
            return false;
        } else if (value instanceof Array) {
            return false;
        } else if (typeof(value) == 'string') {
            if (value == "") {
                return false;
            }
        }

        return isNaN(Number(value)) == false;
    }
}