# Esprima

[
![Tests](https://github.com/jquery/esprima/actions/workflows/tests.yml/badge.svg)
](https://github.com/jquery/esprima/actions/workflows/tests.yml)
[
![Coverage Status](https://codecov.io/gh/jquery/esprima/branch/master/graph/badge.svg)
](https://codecov.io/gh/jquery/esprima)
[
![npm version](https://img.shields.io/npm/v/esprima.svg)
](https://www.npmjs.com/package/esprima)

Esprima ([esprima.org](http://esprima.org)) は、JavaScriptで書かれた高性能で規格準拠の[ECMAScript](http://www.ecma-international.org/publications/standards/Ecma-262.htm)パーサです。

## 機能

*   ECMAScript 2019 (ECMA-262 第10版) のフルサポート
*   [ESTreeプロジェクト](https://github.com/estree/estree)によって標準化された、合理的な[構文木フォーマット](https://github.com/estree/estree/blob/master/es5.md)
*   [React](https://facebook.github.io/react/)の構文拡張であるJSX *(demo unavailable)*の実験的サポート
*   オプションでの構文ノードの位置情報（インデックスベースおよび行・列ベース）の追跡
*   1500以上の[ユニットテスト](https://github.com/jquery/esprima/tree/master/test/fixtures)による徹底的なテスト

## インストール

最新の安定版をインストールするには:

```bash
npm install esprima
```

## 使い方

Esprimaは、JavaScriptプログラムの字句解析（トークン化）または構文解析（パース）を実行するために使用できます。

### Node.js

```javascript
const esprima = require('esprima');
const program = 'const answer = 42';

console.log('Tokens:');
console.dir(esprima.tokenize(program));

console.log('\nSyntax Tree:');
console.dir(esprima.parseScript(program), { depth: null });
```

出力:
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

### ブラウザ / Deno

```javascript
import * as esprima from "https://code4fukui.github.io/esprima/es/esprima.min.js";

const program = 'const answer = 42';

console.log(esprima.tokenize(program));
console.log(esprima.parseScript(program));
```

### コマンドラインツール

Esprimaの`bin`ディレクトリには2つのコマンドラインツールが含まれています:
*   `esparse`: JavaScriptファイルをパースし、構文木を出力します。
*   `esvalidate`: JavaScriptファイルの構文を検証します。

## ドキュメント

詳細については、[完全なドキュメント](http://esprima.org/doc)をご覧ください。

## ビルド

Esprimaをソースからビルドするには、Node.js 8以降が必要です。

```bash
# Clone the repository
git clone https://github.com/jquery/esprima.git
cd esprima

# Install dependencies
npm install

# Run all tests and static analysis
npm test
```

## ライセンス

BSD-2-Clause License
