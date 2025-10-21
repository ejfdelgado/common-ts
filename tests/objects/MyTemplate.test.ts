import { describe, it, expect } from "vitest";

import { CsvFormatterFilters } from "../../src/objects/CsvFormatterFilters.js";
import { MyTemplate } from "../../src/objects/MyTemplate.js";

describe("Render template", () => {
    const renderer = new MyTemplate();

    const cases = [
        {
            name: "Template 1",
            txt: "my name is ${name} and I like ${colors.0.id|mapColor} ${colors.0.id|personal:1:2:3}",
            data: { name: "Edgar", colors: [{ id: 1 }] },
            exp: "my name is Edgar and I like red 1-1-2-3",
        },
        {
            name: "Template 2",
            txt: "All combines: $[for color in ${colors}]$[for name in ${names}]Color ${color.id|mapColor} + ${name}, $[endfor]$[endfor]",
            data: { names: { first: "Edgar", last: "Delgado" }, colors: [{ id: 1 }, { id: 2 }] },
            exp: "All combines: Color red + Edgar, Color red + Delgado, Color blue + Edgar, Color blue + Delgado, ",
        },
        {
            name: "Template 3",
            txt: "Esto es una prueba $[for parent in ${parents}] parent ${parent.name} has $[for child in ${parent.children}] ${child.name} $[endfor] $[endfor] here there is nothing",
            data: {
                parents: [
                    { name: "Dog", children: [{ name: "Pepito" }, { name: "Cuco" }] },
                    { name: "Bird", children: [{ name: "Fly" }, { name: "Shym" }] },
                    { name: "Cat", children: [] }
                ]
            },
            exp: "Esto es una prueba  parent Dog has  Pepito  Cuco   parent Bird has  Fly  Shym   parent Cat has   here there is nothing",
        },
        {
            name: "Template 4",
            txt: "Esto es una prueba $[for parent in ${parents}] parent ${parent.name} has $[for child in ${parent.children}] ${child.name} $[endfor] $[endfor] here there is nothing",
            data: {
                parents: [
                    { name: "Dog", children: undefined },
                    { name: "Bird" },
                    { name: "Cat", children: null }
                ]
            },
            exp: "Esto es una prueba  parent Dog has   parent Bird has   parent Cat has   here there is nothing",
        },
        {
            name: "Template 5",
            txt: 'Es $[if ${color.id} == "texto" && ${algo} === undefined && ${otro.valor} == ${color.id} ] Es uno $[endif] fin',
            data: { color: { id: "texto" }, otro: { valor: "texto" } },
            exp: "Es  Es uno  fin",
        },
        {
            name: "Template 6",
            txt: "Es $[if ${color.id} == 1 && ${algo} === undefined ]Verdadero$[else]Falso$[endif] fin",
            data: { color: { id: 2 } },
            exp: "Es Falso fin",
        },
        {
            name: "Template 7",
            txt: 'Es $[if ${color.id} == 1 && ${algo} === undefined ]Verdadero$[else]pero acá es $[if typeof ${color} == "object" ]Sí$[else]No$[endif]$[endif] fin',
            data: { color: { id: 2 } },
            exp: "Es pero acá es Sí fin",
        },
        {
            name: "Template 8",
            txt: 'Filtrado $[for el in ${arreglo}]$[if ${el.num} >= 3]${el.num} ${el.txt}$[endif]$[endfor]',
            data: {
                arreglo: [
                    { num: 1, txt: "no debe salir" },
                    { num: 2, txt: "tampoco debe salir" },
                    { num: 3, txt: "sí debe salir" }
                ]
            },
            exp: "Filtrado 3 sí debe salir",
        },
        {
            name: "Template 9",
            txt: "my name is ${name} ${lastname} and I like ${colors.0.id} ${colors.0.id}",
            data: { lastname: "Delgado" },
            exp: "my name is ${name} Delgado and I like ${colors.0.id} ${colors.0.id}",
            skipUndefined: true,
        },
        {
            name: "Template 10",
            txt: "my name is ${name} ${lastname} and I like ${colors.0.id} ${colors.0.id}",
            data: { lastname: "Delgado" },
            exp: "my name is undefined Delgado and I like undefined undefined",
            skipUndefined: false,
        },
        {
            name: "Template 11",
            txt: "My ${index} lastname is ${lastname.${index}}",
            data: { lastname: ["delgado", "leyton"], index: 0 },
            exp: "My 0 lastname is delgado",
            skipUndefined: false,
        },
        {
            name: "Template 12",
            txt: "My ${index} lastname is ${lastname.${index}.detail}",
            data: { lastname: [{ detail: "delgado" }, { detail: "leyton" }], index: 0 },
            exp: "My 0 lastname is delgado",
            skipUndefined: false,
        },
        {
            name: "Template 13",
            txt: 'My ${ now | epoch2date : "mmm d yyyy" : "otro"}',
            data: { now: new Date().getTime(), index: 0 },
            exp: "My nada",
            skipUndefined: false,
        },
        {
            name: "Template 14",
            txt: ' $[for el1 in ${abuelo}] $[for el2 in ${el1.padre}] $[for el3 in ${el2.hijo}] ${el3.name} $[endfor] $[endfor] $[endfor] ',
            data: {
                abuelo: [
                    {
                        padre: [
                            {
                                hijo: [
                                    { name: "Hugo" }
                                ]
                            },
                            {
                                hijo: [
                                    { name: "Paco" }
                                ]
                            },
                            {
                                hijo: [
                                    { name: "Luis" }
                                ]
                            },
                        ]
                    }
                ]
            },
            exp: "    Hugo    Paco    Luis    ",
            skipUndefined: false,
        },
        {
            name: "Template 15",
            txt: "$[if ${choice_id} == null]NULL$[else]'${choice_id}'::uuid$[endif],",
            data: {
                choice_id: '3764d5b2-75ec-44fd-89e0-9414f12d5b60',
                assessment_answered_id: '51b62095-b14b-42b2-931e-c8872ab72b6a',
                question_id: 'a48dd6db-0243-4faf-bbbd-dd808e253025',
                date_of_response: 1741050236700
            },
            exp: "'3764d5b2-75ec-44fd-89e0-9414f12d5b60'::uuid,",
            skipUndefined: false,
        },
    ];

    renderer.registerFunction("json", CsvFormatterFilters.json);
    renderer.registerFunction("mapColor", CsvFormatterFilters.map({ 1: "red", 2: "blue" }));
    renderer.registerFunction("personal", (val: string, ...args: any[]) => {
        return val + "-" + args.join("-");
    });
    renderer.registerFunction("rand", CsvFormatterFilters.rand);
    renderer.registerFunction("epoch2date", (value: string, ...args: any[]) => {
        return "nada";
    });

    for (let i = 0; i < cases.length; i++) {
        const myCase = cases[i]!;
        const actual = renderer.render(myCase.txt, myCase.data, myCase.skipUndefined === true);
        it(myCase.name, () => {
            expect(actual).toBe(myCase.exp);
        });
    }
});