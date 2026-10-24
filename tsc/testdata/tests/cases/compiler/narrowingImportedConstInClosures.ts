// @strict: true
// @noEmit: true
// @target: esnext
// @allowJs: true
// @checkJs: true

// @filename: /a.ts
export const maybeFn: (() => void) | undefined = undefined as (() => void) | undefined;
export const box: { a: number } | null = null as { a: number } | null;
export let mutable: string | undefined = undefined as string | undefined;
export const mode: "a" | "b" = "a" as "a" | "b";
const local: string | null = null as string | null;
export { local as renamed };
export default box;
export function fn() {}
export class Cls {}
export interface Named { a: number }

// @filename: /b.ts
export { maybeFn as reexported } from "./a";
export { box as merged } from "./a";
export type merged = number;
export { mutable as mergedMutable } from "./a";
export type mergedMutable = number;

// @filename: /c.ts
export * from "./b";

// @filename: /d.ts
export default (null as { a: number } | null);

// @filename: /e.d.ts
export declare const ambient: { a: number } | null;

// @filename: /f.js
const single = null === null ? { a: 1 } : null;
exports.single = single;
const reassigned = null === null ? { a: 1 } : null;
exports.reassigned = reassigned;
function reset() { exports.reassigned = null; }

// @filename: /main.ts
import boxDefault, { maybeFn, box, mutable, mode, renamed as renamedImport, fn, Cls, Named } from "./a";
import type { Named as TypeOnly } from "./a";
import { reexported, merged, mergedMutable } from "./c";
import * as ns from "./a";
import expressionDefault from "./d";
import { ambient } from "./e";
import { single, reassigned } from "./f";

declare function assertIsDefined<T>(x: T): asserts x is NonNullable<T>;
declare function assertHasValue<T>(x: T): asserts x is T & { value: number };

const Named: Named | null = null as Named | null;
const TypeOnly: TypeOnly | null = null as TypeOnly | null;

if (maybeFn) {
    [1].map(() => maybeFn()); // ok: import of a const
    [1].map(function () { return maybeFn(); }); // ok
}
if (box) {
    [1].map(() => box.a); // ok
    [1].map(() => [2].map(() => box.a)); // ok: nested closures
    const obj = {
        method() { return box.a; }, // ok: object literal method
        get prop() { return box.a; }, // ok: accessor
    };
    const Anonymous = class { method() { return box.a; } }; // ok: class expression method
}
if (boxDefault) {
    [1].map(() => boxDefault.a); // ok: default export of a const
}
if (renamedImport) {
    [1].map(() => renamedImport.length); // ok: renamed export and import of a const
}
if (reexported) {
    [1].map(() => reexported()); // ok: re-export through export *
}
if (merged) {
    [1].map(() => merged.a); // ok: re-export merged with a type of the same name
}
if (ambient) {
    [1].map(() => ambient.a); // ok: const declared in a .d.ts
}
if (Named) {
    [1].map(() => Named.a); // ok: local const merged with an imported type
}
if (TypeOnly) {
    [1].map(() => TypeOnly.a); // ok: same with a type-only import
}
if (single) {
    [1].map(() => single.a); // ok: exports.x = const in a JS module
}
assertIsDefined(box);
[1].map(() => box.a); // ok: assertion narrowing
if (mode === "a") {
    [1].map(() => mode === "b"); // error: literal narrowing is kept as well
    const modes = [1].map(() => mode);
    modes.push("b"); // error: so the inferred array type is "a"[]
}
if (mutable) {
    [1].map(() => mutable.length); // error: an exported let can be reassigned by its module
}
if (reassigned) {
    [1].map(() => reassigned.a); // error: the JS module reassigns the export
}
if (mergedMutable) {
    [1].map(() => mergedMutable.length); // error: still a let behind a merged re-export
}
if (ns.box) {
    [1].map(() => ns.box.a); // error: property access through a namespace import is unchanged
}
if (expressionDefault) {
    [1].map(() => expressionDefault.a); // error: a default-exported expression isn't a const variable
}
assertHasValue(fn);
assertHasValue(Cls);
[1].map(() => fn.value + Cls.value); // error: imported functions and classes aren't const variables
function hoisted() {
    return box.a; // error: function declarations are hoisted
}
