# Esprima

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

[
![Tests](https://github.com/jquery/esprima/actions/workflows/tests.yml/badge.svg)
](https://github.com/jquery/esprima/actions/workflows/tests.yml)
[
![Coverage Status](https://codecov.io/gh/jquery/esprima/branch/master/graph/badge.svg)
](https://codecov.io/gh/jquery/esprima)
[
![npm version](https://img.shields.io/npm/v/esprima.svg)
](https://www.npmjs.com/package/esprima)

Esprima ([esprima.org](http://esprima.org)) is a high-performance, standard-compliant [ECMAScript](http://www.ecma-international.org/publications/standards/Ecma-262.htm) parser written in JavaScript.

## Features

*   Full support for ECMAScript 2019 (ECMA-262 10th Edition)
*   Sensible [syntax tree format](https://github.com/estree/estree/blob/master/es5.md) standardized by the [ESTree project](https://github.com/estree/estree)
*   Experimental support for JSX *(demo unavailable)*, a syntax extension for [React](https://facebook.github.io/react/)
*   Optional tracking of syntax node location (index-based and line-column)
*   Heavily tested with over 1500 [unit tests](https://github.com/jquery/esprima/tree/master/test/fixtures)

## Installation

For the latest stable version:

```bash
npm install esprima
```

## Usage

Esprima can be used to perform lexical analysis (tokenization) or syntactic analysis (parsing) of a JavaScript program.

### Node.js

```javascript
const esprima = require('esprima');
const program = 'const answer = 42';

console.log('Tokens:');
console.dir(esprima.tokenize(program));

console.log('\nSyntax Tree:');
console.dir(esprima.parseScript(program), { depth: null });
```

Output:
```
Tokens:
[
  { type: 'Keyword', value: 'const' },
  { type: 'Identifier', value: 'answer' },
  { type: 'Punctuator', value: '=' },
  { type: 'Numeric', value: '42' }
]

Syntax Tree:
{
  type: 'Program',
  body: [
    {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'answer' },
          init: { type: 'Literal', value: 42, raw: '42' }
        }
      ],
      kind: 'const'
    }
  ],
  sourceType: 'script'
}
```

### Browser / Deno

```javascript
import * as esprima from "https://code4fukui.github.io/esprima/es/esprima.min.js";

const program = 'const answer = 42';

console.log(esprima.tokenize(program));
console.log(esprima.parseScript(program));
```

### Command-Line Tools

Esprima includes two command-line tools in its `bin` directory:
*   `esparse`: Parses a JavaScript file and prints the syntax tree.
*   `esvalidate`: Validates the syntax of a JavaScript file.

## Documentation

For more information, please read the [complete documentation](http://esprima.org/doc).

## Building

To build Esprima from the source, you need Node.js 8 or later.

```bash
# Clone the repository
git clone https://github.com/jquery/esprima.git
cd esprima

# Install dependencies
npm install

# Run all tests and static analysis
npm test
```

## License

BSD-2-Clause License