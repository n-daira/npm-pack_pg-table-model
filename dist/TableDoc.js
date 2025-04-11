"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTableDoc = void 0;
const createTableDoc = (models) => {
    var _a, _b, _c, _d, _e;
    let html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>table document</title>
</head>
<style>
:root {
    --primary: rgb(73, 204, 144);
    --bg-primary: rgba(73, 204, 144, 0.15);
    --border-primary: rgba(73, 204, 144, 0.3);
    --border-gray: rgb(200, 200, 200);
}

body {
    padding: 0px;
    padding-left: 12px;
    padding-right: 12px;
    margin: 0px;
    color: rgb(30, 35, 40);
}

/* title*/
h1 {
    font-size: 28px;
    font-weight: bold;
}

/* db-title*/
h2 {
    background-color: var(--primary);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    color: #ffffff;
    padding-left: 4px;
    margin: 0;
    font-size: 24px;
    font-weight: bold;
}

.db-wrapper {
    border-radius: 8px;
    border: var(--primary) solid 1px;
    margin-bottom: 24px;
}

/* table-title*/
h3 {
    background-color: var(--bg-primary);
    border-top: var(--border-primary) solid 1px;
    margin: 0;
    padding-left: 4px;
    padding-top: 2px;
    padding-bottom: 2px;
    font-size: 18px;
    font-weight: bold;
}

.table-wrapper {
    padding: 0px;
    margin-bottom: 16px;
}

.comment-wrapper {
    padding-left: 4px;
    padding-top: 4px;
    padding-bottom: 8px;
    font-size: 14px;
}

table {
    border-collapse: collapse;
    margin-top: 0px;
    margin-left: 8px;
    margin-right: 8px;
    margin-bottom: 12px;
    font-size: 14px;
}

tr:nth-child(odd) {
    background-color: var(--bg-primary); /* 奇数行の背景色を変更 */
}

tr:nth-child(even) {
    background-color: #ffffff; /* 偶数行の背景色を変更 */
}

th {
    padding-left: 4px;
    padding-right: 4px;
    background-color: var(--primary);
    color: #ffffff;
    border: 1px solid var(--border-gray); /* 線の色と太さを指定 */
}

td {
    border: 1px solid var(--border-primary); /* 線の色と太さを指定 */
    padding-left: 4px;
    padding-right: 4px;
}

/* No */
td:nth-child(1) {
    width: 16px;
    text-align: center;
}

/* PK */
td:nth-child(2) {
    width: 24px;
    text-align: center;
}

/* name */
td:nth-child(3) {
    width: 140px;
}

/* alias */
td:nth-child(4) {
    width: 180px;
}

/* type */
td:nth-child(5) {
    width: 60px;
}

/* length */
td:nth-child(6) {
    width: 40px;
}

/* nullable */
td:nth-child(7) {
    width: 40px;
}

/* default */
td:nth-child(8) {
    width: 120px;
}

/* Foreign Key */
td:nth-child(9) {
    width: 300px;
}

/* comment */
td:nth-child(10) {
    width: auto;
}
</style>

<body>
    <h1>Your Table Definition Document</h1>
`;
    const dbObj = {};
    for (const model of models) {
        if (model.DbName in dbObj === false) {
            dbObj[model.DbName] = [];
        }
        dbObj[model.DbName].push(model);
    }
    for (const [keyDbName, models] of Object.entries(dbObj)) {
        html += `
    <div class="db-wrapper">
        <h2>${keyDbName} Database</h2>`;
        for (const model of models) {
            html += `
        <div class="table-wrapper">
            <h3>${model.TableName} ${model.TableDescription !== '' ? ` : ${model.TableDescription}` : ''}</h3>
            <div class="comment-wrapper">${model.Comment}</div>

            <table>
                <tr>
                    <th>No</th>
                    <th>PK</th>
                    <th>name</th>
                    <th>alias</th>
                    <th>type</th>
                    <th>length</th>
                    <th>nullable</th>
                    <th>default</th>
                    <th>foreign key</th>
                    <th>comment</th>
                </tr>`;
            let index = 0;
            for (const [keyColName, column] of Object.entries(model.Columns)) {
                index++;
                html += `
                <tr>
                    <td>${index}</td>
                    <td>${column.attribute === 'primary' ? 'PK' : ''}</td>
                    <td>${keyColName}</td>
                    <td>${(_a = column.alias) !== null && _a !== void 0 ? _a : keyColName}</td>
                    <td>${column.type}</td>
                    <td>${(_b = column.length) !== null && _b !== void 0 ? _b : ''}</td>
                    <td>${column.attribute === 'nullable' ? 'nullable' : ''}</td>
                    <td>${column.attribute === 'hasDefault' ? (_c = column.default) !== null && _c !== void 0 ? _c : '???' : ''}</td>
                    <td>${(_d = column.fk) !== null && _d !== void 0 ? _d : ''}</td>
                    <td>${(_e = column.comment) !== null && _e !== void 0 ? _e : ''}</td>
                </tr>`;
            }
            html += `
            </table>
        </div>`;
        }
        html += `
    </div>`;
    }
    html += `
</body>
</html>
`;
    return html;
};
exports.createTableDoc = createTableDoc;
