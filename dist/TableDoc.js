"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTableDoc = void 0;
const createTableDoc = (models) => {
    var _a, _b, _c, _d;
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
    --primary-dark: rgb(64, 169, 121);
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


button {
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 2px;
    padding-bottom: 2px;
    background-color: var(--primary);
    border: 0px;
    color: #ffffff;
    border-radius: 999px;
}

button:hover {
    background-color: var(--primary-dark);
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
    font-size: 18px;
    font-weight: bold;
}

.table-wrapper {
    padding: 0px;
    margin-bottom: 16px;
}

.table-title-wrapper {
    background-color: var(--bg-primary);
    border-top: var(--border-primary) solid 1px;
    margin: 0;
    padding: 2px 4px;
    align-items: center;
    display: flex;
}

.table-title-left {
    font-size: 18px;
    font-weight: bold;
    text-align: left;
    font-size: 18px;
    font-weight: bold;
}

.table-title-right {
    margin-left: auto;
    padding: 2px;
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

/* function */
td:nth-child(11) {
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
    const jsCripFuncs = {};
    for (const [keyDbName, models] of Object.entries(dbObj)) {
        html += `
    <div class="db-wrapper">
        <h2>${keyDbName} Database</h2>`;
        for (const model of models) {
            const createFuncName = `clipboard_createTable_${model.DbName}_${model.TableName}`;
            html += `
        <div class="table-wrapper">
            <div class="table-title-wrapper">
                <div class="table-title-left">${model.TableName} ${model.TableDescription !== '' ? ` : ${model.TableDescription}` : ''}</div>
                <button class="table-title-right" onclick="${createFuncName}()">Create文コピー</button>
            </div>
            <div class="comment-wrapper">${model.Comment.replace('\n', '<br>')}</div>

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
                    <th>function</th>
                </tr>`;
            const createColExpressions = [];
            const pkColNames = [];
            const refColExpressions = [];
            let index = 0;
            for (const [keyColName, column] of Object.entries(model.Columns)) {
                index++;
                const addFuncName = `clipboard_addColumn_${model.DbName}_${model.TableName}_${keyColName}`;
                const dropFuncName = `clipboard_dropColumn_${model.DbName}_${model.TableName}_${keyColName}`;
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
                    <td>${column.fk === undefined ? '' : `[${column.fk.table}].[${column.fk.column}]`}</td>
                    <td>${((_d = column.comment) !== null && _d !== void 0 ? _d : '').replace('\n', '<br>')}</td>
                    <td>
                        ${column.attribute === "primary" ? `` : `
                        <button onclick="${addFuncName}()">add column</button>
                        <button onclick="${dropFuncName}()">drop column</button>
                        `}
                    </td>
                </tr>`;
                jsCripFuncs[addFuncName] = `ALTER TABLE ${model.TableName} ADD COLUMN ${keyColName} ${toColumnType(column)} ${toColumnAttibute(column)};`;
                jsCripFuncs[dropFuncName] = `ALTER TABLE ${model.TableName} DROP COLUMN ${keyColName};`;
                // CreateTable作成用
                createColExpressions.push(`${keyColName} ${toColumnType(column)} ${toColumnAttibute(column)}`);
                if (column.attribute === 'primary') {
                    pkColNames.push(keyColName);
                }
                if (column.fk !== undefined) {
                    refColExpressions.push(`FOREIGN KEY (${keyColName}) REFERENCES ${column.fk.table}(${column.fk.column})`);
                }
            }
            // CreateTable作成文
            let expressions = [...createColExpressions];
            if (pkColNames.length > 0) {
                expressions.push(`PRIMARY KEY (${pkColNames.join(', ')})`);
            }
            expressions = [...expressions, ...refColExpressions];
            jsCripFuncs[createFuncName] = `CREATE TABLE ${model.TableName} (\n    ${expressions.join(',\n    ')}\n);`;
            html += `
            </table>
        </div>`;
        }
        html += `
    </div>`;
    }
    html += `\n    <script>\n`;
    for (const [keyFunName, value] of Object.entries(jsCripFuncs)) {
        html += `
        function ${keyFunName}() {
            const el = document.createElement('textarea');
            el.value = \`${value}\`;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            alert('コピーしました');
        }\n`;
    }
    html += `    </script>
</body>
</html>
`;
    return html;
};
exports.createTableDoc = createTableDoc;
function toColumnType(column) {
    switch (column.type) {
        case 'uuid':
            return 'UUID';
        case 'bool':
            return 'BOOLEAN';
        case 'date':
            return 'DATE';
        case 'number':
            return 'INTEGER';
        case 'string':
            return 'VARCHAR(' + column.length + ')';
        case 'time':
            return 'TIME';
        case 'timestamp':
            return 'TIMESTAMP';
    }
}
function toColumnAttibute(column) {
    switch (column.attribute) {
        case 'hasDefault':
            return 'NOT NULL DEFAULT ' + column.default;
        case 'noDefault':
            return 'NOT NULL';
        case 'nullable':
            return 'NULL';
        case 'primary':
            return ''; // 主キーは後で設定するので
    }
}
