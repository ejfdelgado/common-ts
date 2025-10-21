import { describe, it, expect } from "vitest";

import { SimpleObj } from "../../src/objects/SimpleObj.js";
import { sortify } from "../../src/objects/Sortify.js";

describe("Get value Test", () => {
    const MY_CASES = [
        { name: "Read 1", obj: { a: 1 }, key: "a", val: 1 },
        { name: "Read 2", obj: { a: { b: 4 } }, key: "a.b", val: 4 },
        { name: "Read 3", obj: [6], key: "0", val: 6 },
        { name: "Read 4", obj: [{ x: 9 }], key: "0.x", val: 9 },
        { name: "Read 5", obj: null, key: "noex", val: null, def: null },
        { name: "Read 6", obj: { a: ["a", true, false] }, key: "a.2", val: false },
        { name: "Read 7", obj: { a: 1 }, key: "b", val: undefined },
        { name: "Read 8", obj: { x: { v: { a: null } } }, key: "x.v.a.n.j", val: "nada", def: "nada" },
    ];

    for (let i = 0; i < MY_CASES.length; i++) {
        const MY_CASE = MY_CASES[i]!;
        const obj = MY_CASE.obj;
        const key = MY_CASE.key;
        const def = MY_CASE.def;
        const myExpected = MY_CASE.val;
        const response = SimpleObj.getValue(obj, key, def);

        it(MY_CASE.name, () => {
            expect(response).toBe(myExpected);
        });
    }
});

describe("Set value Test", () => {
    const MY_CASES = [
        { name: "Write 1", obj: { a: 1 }, key: "a", val: 2, exp: { a: 2 } },
        { name: "Write 2", obj: { players: {} }, key: "players.P12", val: { name: "Edgar" }, exp: { players: { P12: { name: "Edgar" } } } },
    ];
    for (let i = 0; i < MY_CASES.length; i++) {
        const MY_CASE = MY_CASES[i]!;
        const obj = MY_CASE.obj;
        const key = MY_CASE.key;
        const val = MY_CASE.val;
        const myExpected = MY_CASE.exp;
        const response = SimpleObj.recreate(obj, key, val);
        const textoEsperado = sortify(myExpected);
        const textoCalculado = sortify(response);

        it(MY_CASE.name, () => {
            expect(textoCalculado).toBe(textoEsperado);
        });
    }
});



