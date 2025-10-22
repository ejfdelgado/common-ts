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
    const useProcessor = ["none", "good", "bad", "random"][0];
    const pruebas: PruebaDataType[] = [
        {
            name: "Case 1",
            i: {},
            f: { a: 2 },
            e: { "+": [{ "k": "a", "v": 2 }], "-": [], "*": [] },//solo agregar
        },
        {
            name: "Case 2",
            i: [{ "name": true }],
            f: [{}],
            e: { "+": [], "-": [{ "k": "0.name" }], "*": [] },//solo quitar
        },
        {
            name: "Case 3",
            i: [false],
            f: [true],
            e: { "+": [], "-": [], "*": [{ "k": "0", "v": true }] },//solo modificar
        },
        {
            name: "Case 4",
            i: { a: 1, b: "t", c: true, d: false, e: null, f: undefined },
            f: { a: 1, b: "t", c: true, e: null, f: "soy nuevo" },
            e: { "+": [{ "k": "f", "v": "soy nuevo" }], "-": [{ "k": "d" }], "*": [] }//agregar y quitar
        },
        {
            name: "Case 5",
            i: { a: [2], b: { g: 5 } },
            f: { a: [], b: { g: 6, h: 7 } },
            e: { "+": [{ "k": "b.h", "v": 7 }], "-": [{ "k": "a.0" }], "*": [{ "k": "b.g", "v": 6 }] }//agregar, quitar y modificar
        },
        {
            name: "Case 6",
            i: {
                a: {
                    b: {
                        c: [
                            3,
                            { h: "hola" },
                        ]
                    }
                }
            },
            f: {
                a: {
                    b: {
                        c: [
                            { h: "hola", i: "como", j: "estas" }
                        ]
                    }
                }
            },
            e: {
                "-": [
                    { "k": "a.b.c.1" },
                    { "k": "a.b.c.1.h" },
                ],
                "*": [{ "k": "a.b.c.0", "v": {} }],
                "+": [
                    { "k": "a.b.c.0.h", "v": "hola" },
                    { "k": "a.b.c.0.i", "v": "como" },
                    { "k": "a.b.c.0.j", "v": "estas" }
                ],
            }
        },
        {
            name: "Case 7",
            i: [{ e: 3 }, 5, 8, [9]],
            f: [{ e: 3 }, 5, 8, [9]],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            name: "Case 8",
            i: { a: 5, b: [], c: {} },
            f: { a: 5, b: [], c: {} },
            e: { "+": [], "-": [], "*": [] },
        },
        {
            name: "Case 9",
            i: [1, 2, 3, 4],
            f: [1, 2, 3, 4],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            name: "Case 10",
            i: ["1", "2", "3"],
            f: ["1", "2", "3"],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            name: "Case 11",
            i: [true, false, true],
            f: [true, false, true],
            e: { "+": [], "-": [], "*": [] },
        },
        {
            name: "Case 12",
            i: { a: [5, 6, 7], b: { n: true, h: false, ert: "dzfggfsdg" }, c: [{ g: 6 }, { g: 7 }] },
            f: { a: [5, 6, 7], b: { n: true, h: false, ert: "dzfgfsdgfsdg" }, c: [{ g: 5 }, { g: 6 }, { g: 7 }] },
            e: {
                "*": [
                    { "k": "b.ert", "v": "dzfgfsdgfsdg" },
                    { "k": "c.0.g", "v": 5 },
                    { "k": "c.1.g", "v": 6 },
                ],
                "+": [
                    { "k": "c.2", "v": {} },//{"k":"c.2","v":{"g":7}}
                    { "k": "c.2.g", "v": 7 },
                ],
                "-": [

                ]
            },
        },
        {
            name: "Case 13",
            i: {},
            f: {
                parent: {
                    name: "Fernando",
                    sons: [
                        {
                            name: "Gloria"
                        },
                        {
                            name: "Edgar"
                        }
                    ]
                }
            },
            e: {
                "*": [],
                "+": [
                    { "k": "parent", "v": {} },
                    { "k": "parent.name", "v": "Fernando" },
                    { "k": "parent.sons", "v": [] },
                    { "k": "parent.sons.0", "v": {} },
                    { "k": "parent.sons.1", "v": {} },
                    { "k": "parent.sons.0.name", "v": "Gloria" },
                    { "k": "parent.sons.1.name", "v": "Edgar" }
                ],
                "-": [],
            }
        }
    ];

    const mockProcessorGood = (payload: any) => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                console.log(`Processing ${JSON.stringify(payload, null, 4)} OK`);
                resolve();
            }, 0);
        });
    };

    const getRandomProcessor = (min: number = 500, max: number = 1000) => {
        const mockProcessorRandom = (payload: any) => {
            return new Promise<void>((resolve, reject) => {
                const tiempo = min + Math.random() * (max - min);
                setTimeout(() => {
                    resolve();
                }, tiempo);
            });
        };
        return mockProcessorRandom;
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
    const case1 = pruebas.filter((el) => { return el.name == "Case 1" })[0];
    if (case1) {
        case1.i.p = function () { };
    }
    // Los loops se deben ignorar
    const case6 = pruebas.filter((el) => { return el.name == "Case 6" })[0];
    if (case6) {
        case6.i.loop = case6.i;
    }

    pruebas.forEach((prueba, i) => {
        it(prueba.name, async () => {
            const tuplas = MyTuples.getTuples(prueba.i);
            //console.log(JSON.stringify(tuplas, null, 4));
            const referencia = sortify(prueba.i);
            //console.log(referencia);
            const intercambio = sortify(tuplas);
            let buffer: any = {};
            const builder = MyTuples.getBuilder();
            const builder2 = MyTuples.getBuilder();
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
            if (useProcessor == "bad") {
                builder.setProcesor(getBadProcessor());
            } else if (useProcessor == "good") {
                builder.setProcesor(mockProcessorGood);
            } else if (useProcessor == "random") {
                builder.setProcesor(getRandomProcessor());
            }
            let paths = Object.keys(tuplas);
            if (reverse) {
                paths = paths.reverse();
            }
            // Iterate all paths
            paths.forEach(path => {
                buffer[path] = tuplas[path];
                if (Object.keys(buffer).length >= BATCH_SIZE) {
                    builder.build(buffer);
                    builder2.build(buffer);
                    buffer = {};
                }
            });
            // The last portion if it exists
            if (Object.keys(buffer).length > 0) {
                builder.build(buffer);
                builder2.build(buffer);
                buffer = {};
            }
            const resultadoTxt = sortify(builder.end());
            builder2.end();
            const differences = builder.trackDifferences(prueba.f);
            //console.log(JSON.stringify(differences, null, 4));
            await indicadorActividad;
            const afectado = builder2.affect(differences);

            prueba.e.r = differences.r;
            prueba.e.t = differences.t;
            prueba.e.total = differences.total;
            const differencesTxt = sortify(differences, true);

            if (show) {
                console.log("--------------------------------------------------------");
                console.log(referencia);
                console.log(intercambio);
                console.log(resultadoTxt);
            }

            // Here we verify only the initial state
            expect(resultadoTxt).toBe(referencia);

            // Changes can have different representation
            prueba.e.r = differences.r;
            prueba.e.t = differences.t;
            prueba.e.total = differences.total;
            expect(differencesTxt).toBe(sortify(prueba.e, true));

            // Here we compare the final state
            expect(sortify(afectado)).toBe(sortify(prueba.f));
        }, 5000);
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

describe("Tuple manipulation", () => {
    const builderConfig = {
        MAX_SEND_SIZE: 1000,
        LOW_PRESSURE_MS: 0,
        BACK_OFF_MULTIPLIER: 0,
    };


    it("Empty object goes to the initial state", () => {
        const model: any = {
            persona: {
                nombre: "Edgar",
                edad: 38,
            },
        };
        const builder = MyTuples.getBuilder(builderConfig);
        builder.build({});
        //Here freeze the version
        builder.end();

        const differences1 = builder.trackDifferences(model);
        const afectado1 = builder.affect(differences1);
        expect(sortify(afectado1)).toBe(sortify(model));
    });

    it("Empty object goes to the initial state and add extra modifications", () => {
        const model: any = {
            persona: {
                nombre: "Edgar",
                edad: 38,
            },
        };
        const builder = MyTuples.getBuilder(builderConfig);
        builder.build({});
        //Here freeze the version
        builder.end();

        const differences1 = builder.trackDifferences(model);
        builder.affect(differences1);

        //Perform modifications
        model.persona.nombre = "Edgar Delgado";
        delete model.persona.edad;
        model.persona.color = "red";
        model.persona.animal = "dog";

        const differences2 = builder.trackDifferences(model);
        const afectado2 = builder.affect(differences2);

        expect(sortify(afectado2)).toBe(sortify(model));
    });
});
