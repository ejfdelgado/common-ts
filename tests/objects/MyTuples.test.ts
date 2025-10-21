import { describe, it, expect } from "vitest";

import { MyTuples } from "../../src/objects/MyTuples.js";
import { sortify } from "../../src/objects/Sortify.js";

export interface PruebaDataType {
    name: string;
    f: any;
    i: any;
    e: any;
};

describe("Tuple Handling", () => {
    const BATCH_SIZE = 3;
    const reverse = false;
    const show = false;
    const useProcessor = ["none", "good", "bad"][0];
    const pruebas: PruebaDataType[] = [
        {
            name: "Case 1",
            f: { a: 2 },
            i: {},
            e: { "+": [{ "k": "a", "v": 2 }], "-": [], "*": [] },//solo agregar
        },
        {
            name: "Case 2",
            f: [{}],
            i: [{ 0: true }],
            e: { "+": [], "-": [{ "k": "0.0" }], "*": [] },//solo quitar
        },
        {
            name: "Case 3",
            f: [true],
            i: [false],
            e: { "+": [], "-": [], "*": [{ "k": "0", "v": true }] },//solo modificar
        },
        {
            name: "Case 4",
            f: { a: 1, b: "t", c: true, e: null, f: "soy nuevo" },
            i: { a: 1, b: "t", c: true, d: false, e: null, f: undefined },
            e: { "+": [{ "k": "f", "v": "soy nuevo" }], "-": [{ "k": "d" }], "*": [] }//agregar y quitar
        },
        {
            name: "Case 5",
            f: { a: [], b: { g: 6, h: 7 } },
            i: { a: [2], b: { g: 5 } },
            e: { "+": [{ "k": "b.h", "v": 7 }], "-": [{ "k": "a.0" }], "*": [{ "k": "b.g", "v": 6 }] }//agregar, quitar y modificar
        },
        {
            name: "Case 6",
            f: { a: { b: { c: [{ h: "hola", i: "como", j: "estas" }] } } },
            i: { a: { b: { c: [3, { h: "hola" }] } } },
            e: { "+": [{ "k": "a.b.c.0.h", "v": "hola" }, { "k": "a.b.c.0.i", "v": "como" }, { "k": "a.b.c.0.j", "v": "estas" }], "-": [{ "k": "a.b.c.1" }, { "k": "a.b.c.1.h" }], "*": [{ "k": "a.b.c.0", "v": {} }] }
        },
        {
            name: "Case 7",
            f: [{ e: 3 }, 5, 8, [9]],
            i: [{ e: 3 }, 5, 8, [9]],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            name: "Case 8",
            f: { a: 5, b: [], c: {} },
            i: { a: 5, b: [], c: {} },
            e: { "+": [], "-": [], "*": [] },
        },
        {
            name: "Case 9",
            f: [1, 2, 3, 4],
            i: [1, 2, 3, 4],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            name: "Case 10",
            f: ["1", "2", "3"],
            i: ["1", "2", "3"],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            name: "Case 11",
            f: [true, false, true],
            i: [true, false, true],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            name: "Case 12",
            f: { a: [5, 6, 7], b: { n: true, h: false, ert: "dzfgfsdgfsdg" }, c: [{ g: 5 }, { g: 6 }, { g: 7 }] },
            i: { a: [5, 6, 7], b: { n: true, h: false, ert: "dzfggfsdg" }, c: [{ g: 6 }, { g: 7 }] },
            e: { "*": [{ "k": "b.ert", "v": "dzfgfsdgfsdg" }, { "k": "c.0.g", "v": 5 }, { "k": "c.1.g", "v": 6 }], "+": [{ "k": "c.2", "v": {} }, { "k": "c.2.g", "v": 7 }], "-": [] },
        },
        {
            name: "Case 13",
            f: { a: { 1: 6, 4: 5 } },
            i: { a: { 1: 6, 4: 5 } },
            e: { "+": [], "-": [], "*": [] },
        },
    ];

    const mockProcessorGood = (payload: any) => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                console.log(`Processing ${JSON.stringify(payload, null, 4)} OK`);
                resolve();
            }, 0);
        });
    };

    const getBadProcessor = () => {
        let count = 0;
        let maxCount = 3;
        const mockProcessorBad = (payload: any) => {
            return new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    if (count < maxCount) {
                        console.log(`Processing ${JSON.stringify(payload, null, 4)} ERROR`);
                        reject();
                        count++;
                    } else {
                        console.log(`Processing ${JSON.stringify(payload, null, 4)} OK`);
                        resolve();
                        count = 0;
                    }

                }, 0);
            });
        };
        return mockProcessorBad;
    };

    // Las funciones se deben ignorar
    pruebas[0]!.i.p = function () { };
    // Los loops se deben ignorar
    pruebas[5]!.i.loop = pruebas[5]!.i;

    pruebas.forEach((prueba, i) => {
        const tuplas = MyTuples.getTuples(prueba.i);
        //console.log(JSON.stringify(tuplas, null, 4));
        const referencia = sortify(prueba.i);
        //console.log(referencia);
        const intercambio = sortify(tuplas);
        let buffer: any = {};
        const builder = MyTuples.getBuilder();
        const builder2 = MyTuples.getBuilder();
        if (useProcessor == "bad") {
            builder.setProcesor(getBadProcessor());
        }
        if (useProcessor == "good") {
            builder.setProcesor(mockProcessorGood);
        }
        let llaves1 = Object.keys(tuplas);
        if (reverse) {
            llaves1 = llaves1.reverse();
        }
        llaves1.forEach(element => {
            buffer[element] = tuplas[element];
            if (Object.keys(buffer).length >= BATCH_SIZE) {
                builder.build(buffer);
                builder2.build(buffer);
                buffer = {};
            }
        });
        if (Object.keys(buffer).length > 0) {
            builder.build(buffer);
            builder2.build(buffer);
            buffer = {};
        }
        const resultadoTxt = sortify(builder.end());
        builder2.end();

        const indicadorActividad = new Promise<void>((resolve) => {
            builder.addActivityListener((status: any) => {
                if (!status) {
                    resolve();
                    console.log("Terminado...");
                } else {
                    console.log("Esperando...");
                }
            });
        });
        const differences = builder.trackDifferences(prueba.f);
        //console.log(JSON.stringify(differences, null, 4));
        it(prueba.name, async () => {
            await indicadorActividad;
            const afectado = builder2.affect(differences);
            //console.log(JSON.stringify(afectado, null, 4));
            prueba.e.r = differences.r;
            prueba.e.t = differences.t;
            prueba.e.total = differences.total;
            const differencesTxt = sortify(differences);

            if (show) {
                console.log("--------------------------------------------------------");
                console.log(referencia);
                console.log(intercambio);
                console.log(resultadoTxt);
            }

            expect(resultadoTxt).toBe(referencia);

            expect(differencesTxt).toBe(prueba.e);

            expect(afectado).toBe(prueba.f);
        });
    });
});

describe("IO Converter", () => {
    const pruebas = [
        {
            name: "Case 1",
            i: [
                { k: "6543:fdgfd.ghgf.t", v: 2 },
                { k: "6543:fdgfd.ghgf", v: {} },
                { k: "6543:fdgfd", v: {} },
            ],
            o: {
                "6543:fdgfd.ghgf.t": 2,
                "6543:fdgfd.ghgf": {},
                "6543:fdgfd": {},
            }
        },
        {
            name: "Case 2",
            i: [],
            o: {},
        }
    ];

    for (let i = 0; i < pruebas.length; i++) {
        const actual = pruebas[i]!;
        const input = actual.i;
        const o = actual.o;
        const response = MyTuples.convertFromBD(input);

        const oText = sortify(o);
        const responseTxt = sortify(response);
        it(actual.name, () => {
            expect(responseTxt).toBe(oText);
        });
    }
});

describe("Array operations", () => {
    const restas = [
        { name: "Substraction 1", a: [1, 3, 5], b: [3], r: [1, 5] },
        { name: "Substraction 2", a: [], b: [4, 7], r: [] },
        { name: "Substraction 3", a: [3, 4, 5], b: [], r: [3, 4, 5] },
    ];
    const interseccion = [
        { name: "Intersection 1", a: [1, 3, 5], b: [3], r: [3] },
        { name: "Intersection 2", a: [], b: [4, 8, 9], r: [] },
        { name: "Intersection 3", a: [4, 8, 9], b: [], r: [] },
    ];
    for (let i = 0; i < restas.length; i++) {
        const prueba = restas[i]!;
        const response = MyTuples.restarArreglo(prueba.a, prueba.b);
        const responseTxt = sortify(response);
        const refTxt = sortify(prueba.r);
        it(prueba.name, () => {
            expect(responseTxt).toBe(refTxt);
        });
    }
    for (let i = 0; i < interseccion.length; i++) {
        const prueba = interseccion[i]!;
        const response = MyTuples.intersecionArreglo(prueba.a, prueba.b);
        const responseTxt = sortify(response);
        const refTxt = sortify(prueba.r);
        it(prueba.name, () => {
            expect(responseTxt).toBe(refTxt);
        });
    }
});

describe("Array compress", () => {
    const casos = [
        { name: "Case 1", i: { someArray: [1, 23, 3, 4], maxLength: 5 }, myExpected: ["[1]", "[23]", "[3,4]"] },
        { name: "Case 2", i: { someArray: [1, 230, 3, 4], maxLength: 5 }, myExpected: ["[1]", "[230]", "[3,4]"] },
        { name: "Case 3", i: { someArray: [1, 2301, 3, 4], maxLength: 5 }, myExpected: "Can't compress with size 5 one item has size 4" },
        { name: "Case 4", i: { someArray: [1, 2, 3, 4], maxLength: 5 }, myExpected: ["[1,2]", "[3,4]"] },
    ];

    for (let i = 0; i < casos.length; i++) {
        const caso = casos[i]!;
        let myActual = null;
        let myRaw: any = null;
        try {
            myRaw = MyTuples.arrayCompress(caso.i.someArray, caso.i.maxLength);
            myActual = sortify(myRaw);
        } catch (err: any) {
            myActual = sortify(err.message);
        }

        const myExpected = sortify(caso.myExpected);
        it(caso.name + " compress", () => {
            expect(myActual).toBe(myExpected);
        });

        if (caso.myExpected instanceof Array) {
            // Se valida la descompresión
            const uncompressed = MyTuples.arrayUnCompress(myRaw);
            const unCompressExpected = sortify(caso.i.someArray);
            const unCompressActual = sortify(uncompressed);
            it(caso.name + " uncompress", () => {
                expect(unCompressActual).toBe(unCompressExpected);
            });
        }
    }
});

export const testSimpleTuples = () => {

    const mockProcessorGood = (payload: any) => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                console.log(`Processing ${JSON.stringify(payload, null, 4)} OK`);
                resolve();
            }, 0);
        });
    };

    let model: any = { persona: { nombre: "Edgar", edad: 38 } };
    const builderConfig = { MAX_SEND_SIZE: 1000, LOW_PRESSURE_MS: 0, BACK_OFF_MULTIPLIER: 0 };
    const builder = MyTuples.getBuilder(builderConfig);
    builder.setProcesor(mockProcessorGood);
    builder.build({});
    const res1 = builder.end();
    model.persona.nombre = "Edgar Delgado";
    delete model.persona.edad;
    model.persona.color = "red";
    model.persona.animal = "dog";
    //console.log(res1);

    const differences1 = builder.trackDifferences(model);
    const afectado1 = builder.affect(differences1);
    console.log(afectado1);

    const differences2 = builder.trackDifferences({});
    const afectado2 = builder.affect(differences2);
    console.log(afectado2);

    const differences3 = builder.trackDifferences({ a: 1 });
    const afectado3 = builder.affect(differences3);
    console.log(afectado3);
}