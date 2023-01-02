//import { parse } from "./es/esprima.min.js";
import * as esprima from "./es/esprima.min.js";
const parse = esprima.parse;

console.log(JSON.stringify(parse("(a, b) => a + b"), null, 2));
