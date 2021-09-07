"use strict";
/* Copyright © 2021 Richard Rodger, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Struct = void 0;
const NOMAP = {};
const NOARR = [];
class Struct {
    constructor(type, def) {
        this.map = NOMAP;
        this.arr = NOARR;
        if (Array.isArray(type)) {
            this.type = 'arr';
            this.arr = type;
        }
        else if (null != type && 'object' === typeof (type)) {
            this.type = 'map';
            this.map = type;
        }
        else {
            // console.log('T', type)
            this.type = (null == type.name ? String(type) : type.name).toLowerCase();
        }
        this.def = def;
    }
}
exports.Struct = Struct;
function Norma() {
}
Norma.Struct = Struct;
Norma.parse = function (spec) {
    let root = new Struct({});
    let stack = [{
            point: spec,
            path: undefined,
            parent: root,
            key: '',
        }];
    let entry = undefined;
    while (entry = stack.shift()) {
        let p = entry.point;
        let key = entry.key;
        let path = entry.path;
        let parent = entry.parent;
        let ref = parent[parent.type];
        let s;
        // console.log('P', p)
        if (Array.isArray(p)) {
            s = new Struct([], []);
            if (null != p[0]) {
                stack.push({
                    point: p[0],
                    path: (null == path ? '' : path) + '[0]',
                    parent: s,
                    key: '0'
                });
            }
        }
        else if (null != p && 'object' == typeof (p)) {
            s = new Struct({}, {});
            for (let k in p) {
                stack.push({
                    point: p[k],
                    path: null == path ? k : path + '.' + k,
                    parent: s,
                    key: k
                });
            }
        }
        // else if String, Number, etc - required
        else if (null != p && 'function' === typeof (p)) {
            s = new Struct(p.name);
        }
        else {
            // verbatim defines default
            s = new Struct(typeof (p), p);
        }
        ref[key] = s;
    }
    return root.map[''];
};
function isType(node, type) {
    let nt = typeof (node);
    return 'map' === type ? (null != node && 'object' === nt) :
        'arr' === type ? Array.isArray(node) :
            nt === type;
}
Norma.validate = function (node, struct, errlog) {
    let root = { '': node };
    let stack = [{
            node,
            struct,
            path: undefined,
            parent: root,
            key: '',
        }];
    let entry = undefined;
    while (entry = stack.shift()) {
        let s = entry.struct;
        let n = entry.node;
        let key = entry.key;
        let path = entry.path;
        let parent = entry.parent;
        let ist = isType(n, s.type);
        if (!ist) {
            if (undefined === n && undefined !== s.def) {
                parent[key] = s.def;
            }
            else {
                errlog.push({
                    err: 'not-type',
                    path: null == path ? '' : path,
                    type: s.type,
                    was: n
                });
            }
        }
        else if ('map' === s.type) {
            if (undefined === n && undefined !== s.def) {
                parent[key] = s.def;
            }
            // for (let k in n) {
            for (let k in s.map) {
                stack.push({
                    node: n[k],
                    struct: s.map[k],
                    path: null == path ? k : path + '.' + k,
                    parent: n,
                    key: k
                });
            }
        }
        else if ('arr' === s.type) {
            if (undefined === n && undefined !== s.def) {
                parent[key] = s.def;
            }
            for (let i = 0; i < n.length; i++) {
                stack.push({
                    node: n[i],
                    struct: s.arr[0],
                    path: (null == path ? '' : path) + '[' + i + ']',
                    parent: n,
                    key: '' + i
                });
            }
        }
    }
    return root[''];
};
exports.default = Norma;
if ('undefined' !== typeof (module)) {
    module.exports = Norma;
}
//# sourceMappingURL=norma.js.map