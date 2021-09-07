declare type StructMap = {
    [key: string]: Struct;
};
declare type StructArr = Struct[];
declare type StructErr = {
    err: string;
    path: string;
    type: string;
    was: any;
};
declare class Struct {
    type: string;
    map: StructMap;
    arr: StructArr;
    def: any;
    constructor(type: any, def?: any);
}
declare function Norma(): void;
declare namespace Norma {
    var Struct: typeof import("./norma").Struct;
    var parse: (spec: any) => Struct;
    var validate: (node: any, struct: Struct, errlog: StructErr[]) => any;
}
export { Struct };
export type { StructMap, StructArr, StructErr, };
export default Norma;
