/*
  Copyright JS Foundation and other contributors, https://js.foundation/

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
import { CommentHandler } from './comment-handler.js';
import { JSXParser } from './jsx-parser.js';
import { Parser } from './parser.js';
import { Tokenizer } from './tokenizer.js';
export function parse(code, options, delegate) {
    var commentHandler = null;
    var proxyDelegate = function (node, metadata) {
        if (delegate) {
            delegate(node, metadata);
        }
        if (commentHandler) {
            commentHandler.visit(node, metadata);
        }
    };
    var parserDelegate = (typeof delegate === 'function') ? proxyDelegate : null;
    var collectComment = false;
    if (options) {
        collectComment = (typeof options.comment === 'boolean' && options.comment);
        var attachComment = (typeof options.attachComment === 'boolean' && options.attachComment);
        if (collectComment || attachComment) {
            commentHandler = new CommentHandler();
            commentHandler.attach = attachComment;
            options.comment = true;
            parserDelegate = proxyDelegate;
        }
    }
    var isModule = false;
    if (options && typeof options.sourceType === 'string') {
        isModule = (options.sourceType === 'module');
    }
    var parser;
    if (options && typeof options.jsx === 'boolean' && options.jsx) {
        parser = new JSXParser(code, options, parserDelegate);
    }
    else {
        parser = new Parser(code, options, parserDelegate);
    }
    var program = isModule ? parser.parseModule() : parser.parseScript();
    var ast = program;
    if (collectComment && commentHandler) {
        ast.comments = commentHandler.comments;
    }
    if (parser.config.tokens) {
        ast.tokens = parser.tokens;
    }
    if (parser.config.tolerant) {
        ast.errors = parser.errorHandler.errors;
    }
    return ast;
}
export function parseModule(code, options, delegate) {
    var parsingOptions = options || {};
    parsingOptions.sourceType = 'module';
    return parse(code, parsingOptions, delegate);
}
export function parseScript(code, options, delegate) {
    var parsingOptions = options || {};
    parsingOptions.sourceType = 'script';
    return parse(code, parsingOptions, delegate);
}
export function tokenize(code, options, delegate) {
    var tokenizer = new Tokenizer(code, options);
    var tokens = [];
    try {
        while (true) {
            var token = tokenizer.getNextToken();
            if (!token) {
                break;
            }
            if (delegate) {
                token = delegate(token);
            }
            tokens.push(token);
        }
    }
    catch (e) {
        tokenizer.errorHandler.tolerate(e);
    }
    if (tokenizer.errorHandler.tolerant) {
        tokens.errors = tokenizer.errors();
    }
    return tokens;
}
export { Syntax } from './syntax.js';
// Sync with *.json manifests.
export var version = '4.0.0-dev';
