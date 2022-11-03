import { parse } from "./es/esprima.min.js";

console.log(JSON.stringify(parse("(a, b) => a + b"), null, 2));
