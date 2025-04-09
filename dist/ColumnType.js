"use strict";
// import { ColumnAttributeEnum, ColumnTypeEnum } from "./Type";
// export class ColumnType {
//     private id: number;
//     get Id(): number {
//         return this.id;
//     }
//     private name: string;
//     get Name(): string {
//         return this.name;
//     }
//     private type: ColumnTypeEnum;
//     get Type(): ColumnTypeEnum {
//         return this.type
//     }
//     private length: number | null;
//     get Length(): number {
//         return this.length == null ? 0 : this.length;
//     }
//     private attribute: ColumnAttributeEnum;
//     get Attribute(): ColumnAttributeEnum {
//         return this.attribute;
//     }
//     constructor(
//         id: number,
//         name: string,
//         type: ColumnTypeEnum,
//         length: number | null,
//         attribute: ColumnAttributeEnum
//     ) {
//         this.id = id;
//         this.name = name;
//         this.type = type;
//         if (type == ColumnTypeEnum.String) {
//             if (length == null) {
//                 throw new Error(`ColumnTypeのtypeがstringの場合はlengthが必須です。(id:${this.id})`);
//             }
//             this.length = length;
//         } else {
//             this.length = null;
//         }
//         this.attribute = attribute;
//     }
// }
