// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var Syntax = {
    AssignmentExpression: 'AssignmentExpression',
    AssignmentPattern: 'AssignmentPattern',
    ArrayExpression: 'ArrayExpression',
    ArrayPattern: 'ArrayPattern',
    ArrowFunctionExpression: 'ArrowFunctionExpression',
    AwaitExpression: 'AwaitExpression',
    BlockStatement: 'BlockStatement',
    BinaryExpression: 'BinaryExpression',
    BreakStatement: 'BreakStatement',
    CallExpression: 'CallExpression',
    CatchClause: 'CatchClause',
    ChainExpression: 'ChainExpression',
    ClassBody: 'ClassBody',
    ClassDeclaration: 'ClassDeclaration',
    ClassExpression: 'ClassExpression',
    ConditionalExpression: 'ConditionalExpression',
    ContinueStatement: 'ContinueStatement',
    DoWhileStatement: 'DoWhileStatement',
    DebuggerStatement: 'DebuggerStatement',
    EmptyStatement: 'EmptyStatement',
    ExportAllDeclaration: 'ExportAllDeclaration',
    ExportDefaultDeclaration: 'ExportDefaultDeclaration',
    ExportNamedDeclaration: 'ExportNamedDeclaration',
    ExportSpecifier: 'ExportSpecifier',
    ExpressionStatement: 'ExpressionStatement',
    ForStatement: 'ForStatement',
    ForOfStatement: 'ForOfStatement',
    ForInStatement: 'ForInStatement',
    FunctionDeclaration: 'FunctionDeclaration',
    FunctionExpression: 'FunctionExpression',
    Identifier: 'Identifier',
    IfStatement: 'IfStatement',
    Import: 'Import',
    ImportDeclaration: 'ImportDeclaration',
    ImportDefaultSpecifier: 'ImportDefaultSpecifier',
    ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
    ImportSpecifier: 'ImportSpecifier',
    Literal: 'Literal',
    LabeledStatement: 'LabeledStatement',
    LogicalExpression: 'LogicalExpression',
    MemberExpression: 'MemberExpression',
    MetaProperty: 'MetaProperty',
    MethodDefinition: 'MethodDefinition',
    NewExpression: 'NewExpression',
    ObjectExpression: 'ObjectExpression',
    ObjectPattern: 'ObjectPattern',
    Program: 'Program',
    Property: 'Property',
    RestElement: 'RestElement',
    ReturnStatement: 'ReturnStatement',
    SequenceExpression: 'SequenceExpression',
    SpreadElement: 'SpreadElement',
    Super: 'Super',
    SwitchCase: 'SwitchCase',
    SwitchStatement: 'SwitchStatement',
    TaggedTemplateExpression: 'TaggedTemplateExpression',
    TemplateElement: 'TemplateElement',
    TemplateLiteral: 'TemplateLiteral',
    ThisExpression: 'ThisExpression',
    ThrowStatement: 'ThrowStatement',
    TryStatement: 'TryStatement',
    UnaryExpression: 'UnaryExpression',
    UpdateExpression: 'UpdateExpression',
    VariableDeclaration: 'VariableDeclaration',
    VariableDeclarator: 'VariableDeclarator',
    WhileStatement: 'WhileStatement',
    WithStatement: 'WithStatement',
    YieldExpression: 'YieldExpression'
};
var CommentHandler = function() {
    function CommentHandler() {
        this.attach = false;
        this.comments = [];
        this.stack = [];
        this.leading = [];
        this.trailing = [];
    }
    CommentHandler.prototype.insertInnerComments = function(node, metadata) {
        if (node.type === Syntax.BlockStatement && node.body.length === 0) {
            var innerComments = [];
            for(var i = this.leading.length - 1; i >= 0; --i){
                var entry = this.leading[i];
                if (metadata.end.offset >= entry.start) {
                    innerComments.unshift(entry.comment);
                    this.leading.splice(i, 1);
                    this.trailing.splice(i, 1);
                }
            }
            if (innerComments.length) {
                node.innerComments = innerComments;
            }
        }
    };
    CommentHandler.prototype.findTrailingComments = function(metadata) {
        var trailingComments = [];
        if (this.trailing.length > 0) {
            for(var i = this.trailing.length - 1; i >= 0; --i){
                var entry = this.trailing[i];
                if (entry.start >= metadata.end.offset) {
                    trailingComments.unshift(entry.comment);
                }
            }
            this.trailing.length = 0;
            return trailingComments;
        }
        var last = this.stack[this.stack.length - 1];
        if (last && last.node.trailingComments) {
            var firstComment = last.node.trailingComments[0];
            if (firstComment && firstComment.range[0] >= metadata.end.offset) {
                trailingComments = last.node.trailingComments;
                delete last.node.trailingComments;
            }
        }
        return trailingComments;
    };
    CommentHandler.prototype.findLeadingComments = function(metadata) {
        var leadingComments = [];
        var target;
        while(this.stack.length > 0){
            var entry = this.stack[this.stack.length - 1];
            if (entry && entry.start >= metadata.start.offset) {
                target = entry.node;
                this.stack.pop();
            } else {
                break;
            }
        }
        if (target) {
            var count = target.leadingComments ? target.leadingComments.length : 0;
            for(var i = count - 1; i >= 0; --i){
                var comment = target.leadingComments[i];
                if (comment.range[1] <= metadata.start.offset) {
                    leadingComments.unshift(comment);
                    target.leadingComments.splice(i, 1);
                }
            }
            if (target.leadingComments && target.leadingComments.length === 0) {
                delete target.leadingComments;
            }
            return leadingComments;
        }
        for(var i = this.leading.length - 1; i >= 0; --i){
            var entry = this.leading[i];
            if (entry.start <= metadata.start.offset) {
                leadingComments.unshift(entry.comment);
                this.leading.splice(i, 1);
            }
        }
        return leadingComments;
    };
    CommentHandler.prototype.visitNode = function(node, metadata) {
        if (node.type === Syntax.Program && node.body.length > 0) {
            return;
        }
        this.insertInnerComments(node, metadata);
        var trailingComments = this.findTrailingComments(metadata);
        var leadingComments = this.findLeadingComments(metadata);
        if (leadingComments.length > 0) {
            node.leadingComments = leadingComments;
        }
        if (trailingComments.length > 0) {
            node.trailingComments = trailingComments;
        }
        this.stack.push({
            node: node,
            start: metadata.start.offset
        });
    };
    CommentHandler.prototype.visitComment = function(node, metadata) {
        var type = node.type[0] === 'L' ? 'Line' : 'Block';
        var comment = {
            type: type,
            value: node.value
        };
        if (node.range) {
            comment.range = node.range;
        }
        if (node.loc) {
            comment.loc = node.loc;
        }
        this.comments.push(comment);
        if (this.attach) {
            var entry = {
                comment: {
                    type: type,
                    value: node.value,
                    range: [
                        metadata.start.offset,
                        metadata.end.offset
                    ]
                },
                start: metadata.start.offset
            };
            if (node.loc) {
                entry.comment.loc = node.loc;
            }
            node.type = type;
            this.leading.push(entry);
            this.trailing.push(entry);
        }
    };
    CommentHandler.prototype.visit = function(node, metadata) {
        if (node.type === 'LineComment') {
            this.visitComment(node, metadata);
        } else if (node.type === 'BlockComment') {
            this.visitComment(node, metadata);
        } else if (this.attach) {
            this.visitNode(node, metadata);
        }
    };
    return CommentHandler;
}();
var Regex = {
    NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB67\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/,
    NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05EF-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u07FD\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D3-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u09FE\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1878\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CD0-\u1CD2\u1CD4-\u1CFA\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB67\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD27\uDD30-\uDD39\uDF00-\uDF1C\uDF27\uDF30-\uDF50\uDFE0-\uDFF6]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD44-\uDD46\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDC9-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3B-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC5E\uDC5F\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDC00-\uDC3A\uDCA0-\uDCE9\uDCFF\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDE1\uDDE3\uDDE4\uDE00-\uDE3E\uDE47\uDE50-\uDE99\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD00-\uDD2C\uDD30-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4B\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
};
var Character = {
    fromCodePoint: function(cp) {
        return cp < 0x10000 ? String.fromCharCode(cp) : String.fromCharCode(0xD800 + (cp - 0x10000 >> 10)) + String.fromCharCode(0xDC00 + (cp - 0x10000 & 1023));
    },
    isWhiteSpace: function(cp) {
        return cp === 0x20 || cp === 0x09 || cp === 0x0B || cp === 0x0C || cp === 0xA0 || cp >= 0x1680 && [
            0x1680,
            0x2000,
            0x2001,
            0x2002,
            0x2003,
            0x2004,
            0x2005,
            0x2006,
            0x2007,
            0x2008,
            0x2009,
            0x200A,
            0x202F,
            0x205F,
            0x3000,
            0xFEFF
        ].indexOf(cp) >= 0;
    },
    isLineTerminator: function(cp) {
        return cp === 0x0A || cp === 0x0D || cp === 0x2028 || cp === 0x2029;
    },
    isIdentifierStart: function(cp) {
        return cp === 0x24 || cp === 0x5F || cp >= 0x41 && cp <= 0x5A || cp >= 0x61 && cp <= 0x7A || cp === 0x5C || cp >= 0x80 && Regex.NonAsciiIdentifierStart.test(Character.fromCodePoint(cp));
    },
    isIdentifierPart: function(cp) {
        return cp === 0x24 || cp === 0x5F || cp >= 0x41 && cp <= 0x5A || cp >= 0x61 && cp <= 0x7A || cp >= 0x30 && cp <= 0x39 || cp === 0x5C || cp >= 0x80 && Regex.NonAsciiIdentifierPart.test(Character.fromCodePoint(cp));
    },
    isDecimalDigit: function(cp) {
        return cp >= 0x30 && cp <= 0x39;
    },
    isDecimalDigitChar: function(ch) {
        return ch.length === 1 && Character.isDecimalDigit(ch.charCodeAt(0));
    },
    isHexDigit: function(cp) {
        return cp >= 0x30 && cp <= 0x39 || cp >= 0x41 && cp <= 0x46 || cp >= 0x61 && cp <= 0x66;
    },
    isOctalDigit: function(cp) {
        return cp >= 0x30 && cp <= 0x37;
    }
};
var JSXSyntax = {
    JSXAttribute: 'JSXAttribute',
    JSXClosingElement: 'JSXClosingElement',
    JSXClosingFragment: 'JSXClosingFragment',
    JSXElement: 'JSXElement',
    JSXEmptyExpression: 'JSXEmptyExpression',
    JSXExpressionContainer: 'JSXExpressionContainer',
    JSXIdentifier: 'JSXIdentifier',
    JSXMemberExpression: 'JSXMemberExpression',
    JSXNamespacedName: 'JSXNamespacedName',
    JSXOpeningElement: 'JSXOpeningElement',
    JSXOpeningFragment: 'JSXOpeningFragment',
    JSXSpreadAttribute: 'JSXSpreadAttribute',
    JSXText: 'JSXText'
};
var JSXClosingElement = function() {
    function JSXClosingElement(name) {
        this.type = JSXSyntax.JSXClosingElement;
        this.name = name;
    }
    return JSXClosingElement;
}();
var JSXClosingFragment = function() {
    function JSXClosingFragment() {
        this.type = JSXSyntax.JSXClosingFragment;
    }
    return JSXClosingFragment;
}();
var JSXElement = function() {
    function JSXElement(openingElement, children, closingElement) {
        this.type = JSXSyntax.JSXElement;
        this.openingElement = openingElement;
        this.children = children;
        this.closingElement = closingElement;
    }
    return JSXElement;
}();
var JSXEmptyExpression = function() {
    function JSXEmptyExpression() {
        this.type = JSXSyntax.JSXEmptyExpression;
    }
    return JSXEmptyExpression;
}();
var JSXExpressionContainer = function() {
    function JSXExpressionContainer(expression) {
        this.type = JSXSyntax.JSXExpressionContainer;
        this.expression = expression;
    }
    return JSXExpressionContainer;
}();
var JSXIdentifier = function() {
    function JSXIdentifier(name) {
        this.type = JSXSyntax.JSXIdentifier;
        this.name = name;
    }
    return JSXIdentifier;
}();
var JSXMemberExpression = function() {
    function JSXMemberExpression(object, property) {
        this.type = JSXSyntax.JSXMemberExpression;
        this.object = object;
        this.property = property;
    }
    return JSXMemberExpression;
}();
var JSXAttribute = function() {
    function JSXAttribute(name, value) {
        this.type = JSXSyntax.JSXAttribute;
        this.name = name;
        this.value = value;
    }
    return JSXAttribute;
}();
var JSXNamespacedName = function() {
    function JSXNamespacedName(namespace, name) {
        this.type = JSXSyntax.JSXNamespacedName;
        this.namespace = namespace;
        this.name = name;
    }
    return JSXNamespacedName;
}();
var JSXOpeningElement = function() {
    function JSXOpeningElement(name, selfClosing, attributes) {
        this.type = JSXSyntax.JSXOpeningElement;
        this.name = name;
        this.selfClosing = selfClosing;
        this.attributes = attributes;
    }
    return JSXOpeningElement;
}();
var JSXOpeningFragment = function() {
    function JSXOpeningFragment(selfClosing) {
        this.type = JSXSyntax.JSXOpeningFragment;
        this.selfClosing = selfClosing;
    }
    return JSXOpeningFragment;
}();
var JSXSpreadAttribute = function() {
    function JSXSpreadAttribute(argument) {
        this.type = JSXSyntax.JSXSpreadAttribute;
        this.argument = argument;
    }
    return JSXSpreadAttribute;
}();
var JSXText = function() {
    function JSXText(value, raw) {
        this.type = JSXSyntax.JSXText;
        this.value = value;
        this.raw = raw;
    }
    return JSXText;
}();
var ArrayExpression = function() {
    function ArrayExpression(elements) {
        this.type = Syntax.ArrayExpression;
        this.elements = elements;
    }
    return ArrayExpression;
}();
var ArrayPattern = function() {
    function ArrayPattern(elements) {
        this.type = Syntax.ArrayPattern;
        this.elements = elements;
    }
    return ArrayPattern;
}();
var ArrowFunctionExpression = function() {
    function ArrowFunctionExpression(params, body, expression) {
        this.type = Syntax.ArrowFunctionExpression;
        this.id = null;
        this.params = params;
        this.body = body;
        this.generator = false;
        this.expression = expression;
        this.async = false;
    }
    return ArrowFunctionExpression;
}();
var AssignmentExpression = function() {
    function AssignmentExpression(operator, left, right) {
        this.type = Syntax.AssignmentExpression;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    return AssignmentExpression;
}();
var AssignmentPattern = function() {
    function AssignmentPattern(left, right) {
        this.type = Syntax.AssignmentPattern;
        this.left = left;
        this.right = right;
    }
    return AssignmentPattern;
}();
var AsyncArrowFunctionExpression = function() {
    function AsyncArrowFunctionExpression(params, body, expression) {
        this.type = Syntax.ArrowFunctionExpression;
        this.id = null;
        this.params = params;
        this.body = body;
        this.generator = false;
        this.expression = expression;
        this.async = true;
    }
    return AsyncArrowFunctionExpression;
}();
var AsyncFunctionDeclaration = function() {
    function AsyncFunctionDeclaration(id, params, body, generator) {
        this.type = Syntax.FunctionDeclaration;
        this.id = id;
        this.params = params;
        this.body = body;
        this.generator = generator;
        this.expression = false;
        this.async = true;
    }
    return AsyncFunctionDeclaration;
}();
var AsyncFunctionExpression = function() {
    function AsyncFunctionExpression(id, params, body, generator) {
        this.type = Syntax.FunctionExpression;
        this.id = id;
        this.params = params;
        this.body = body;
        this.generator = generator;
        this.expression = false;
        this.async = true;
    }
    return AsyncFunctionExpression;
}();
var AwaitExpression = function() {
    function AwaitExpression(argument) {
        this.type = Syntax.AwaitExpression;
        this.argument = argument;
    }
    return AwaitExpression;
}();
var BinaryExpression = function() {
    function BinaryExpression(operator, left, right) {
        var logical = operator === '||' || operator === '&&' || operator === '??';
        this.type = logical ? Syntax.LogicalExpression : Syntax.BinaryExpression;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    return BinaryExpression;
}();
var BlockStatement = function() {
    function BlockStatement(body) {
        this.type = Syntax.BlockStatement;
        this.body = body;
    }
    return BlockStatement;
}();
var BreakStatement = function() {
    function BreakStatement(label) {
        this.type = Syntax.BreakStatement;
        this.label = label;
    }
    return BreakStatement;
}();
var CallExpression = function() {
    function CallExpression(callee, args, optional) {
        this.type = Syntax.CallExpression;
        this.callee = callee;
        this.arguments = args;
        this.optional = optional;
    }
    return CallExpression;
}();
var CatchClause = function() {
    function CatchClause(param, body) {
        this.type = Syntax.CatchClause;
        this.param = param;
        this.body = body;
    }
    return CatchClause;
}();
var ChainExpression = function() {
    function ChainExpression(expression) {
        this.type = Syntax.ChainExpression;
        this.expression = expression;
    }
    return ChainExpression;
}();
var ClassBody = function() {
    function ClassBody(body) {
        this.type = Syntax.ClassBody;
        this.body = body;
    }
    return ClassBody;
}();
var ClassDeclaration = function() {
    function ClassDeclaration(id, superClass, body) {
        this.type = Syntax.ClassDeclaration;
        this.id = id;
        this.superClass = superClass;
        this.body = body;
    }
    return ClassDeclaration;
}();
var ClassExpression = function() {
    function ClassExpression(id, superClass, body) {
        this.type = Syntax.ClassExpression;
        this.id = id;
        this.superClass = superClass;
        this.body = body;
    }
    return ClassExpression;
}();
var ComputedMemberExpression = function() {
    function ComputedMemberExpression(object, property, optional) {
        this.type = Syntax.MemberExpression;
        this.computed = true;
        this.object = object;
        this.property = property;
        this.optional = optional;
    }
    return ComputedMemberExpression;
}();
var ConditionalExpression = function() {
    function ConditionalExpression(test, consequent, alternate) {
        this.type = Syntax.ConditionalExpression;
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    return ConditionalExpression;
}();
var ContinueStatement = function() {
    function ContinueStatement(label) {
        this.type = Syntax.ContinueStatement;
        this.label = label;
    }
    return ContinueStatement;
}();
var DebuggerStatement = function() {
    function DebuggerStatement() {
        this.type = Syntax.DebuggerStatement;
    }
    return DebuggerStatement;
}();
var Directive = function() {
    function Directive(expression, directive) {
        this.type = Syntax.ExpressionStatement;
        this.expression = expression;
        this.directive = directive;
    }
    return Directive;
}();
var DoWhileStatement = function() {
    function DoWhileStatement(body, test) {
        this.type = Syntax.DoWhileStatement;
        this.body = body;
        this.test = test;
    }
    return DoWhileStatement;
}();
var EmptyStatement = function() {
    function EmptyStatement() {
        this.type = Syntax.EmptyStatement;
    }
    return EmptyStatement;
}();
var ExportAllDeclaration = function() {
    function ExportAllDeclaration(source) {
        this.type = Syntax.ExportAllDeclaration;
        this.source = source;
    }
    return ExportAllDeclaration;
}();
var ExportDefaultDeclaration = function() {
    function ExportDefaultDeclaration(declaration) {
        this.type = Syntax.ExportDefaultDeclaration;
        this.declaration = declaration;
    }
    return ExportDefaultDeclaration;
}();
var ExportNamedDeclaration = function() {
    function ExportNamedDeclaration(declaration, specifiers, source) {
        this.type = Syntax.ExportNamedDeclaration;
        this.declaration = declaration;
        this.specifiers = specifiers;
        this.source = source;
    }
    return ExportNamedDeclaration;
}();
var ExportSpecifier = function() {
    function ExportSpecifier(local, exported) {
        this.type = Syntax.ExportSpecifier;
        this.exported = exported;
        this.local = local;
    }
    return ExportSpecifier;
}();
var ExpressionStatement = function() {
    function ExpressionStatement(expression) {
        this.type = Syntax.ExpressionStatement;
        this.expression = expression;
    }
    return ExpressionStatement;
}();
var ForInStatement = function() {
    function ForInStatement(left, right, body) {
        this.type = Syntax.ForInStatement;
        this.left = left;
        this.right = right;
        this.body = body;
        this.each = false;
    }
    return ForInStatement;
}();
var ForOfStatement = function() {
    function ForOfStatement(left, right, body, _await) {
        this.type = Syntax.ForOfStatement;
        this.await = _await;
        this.left = left;
        this.right = right;
        this.body = body;
    }
    return ForOfStatement;
}();
var ForStatement = function() {
    function ForStatement(init, test, update, body) {
        this.type = Syntax.ForStatement;
        this.init = init;
        this.test = test;
        this.update = update;
        this.body = body;
    }
    return ForStatement;
}();
var FunctionDeclaration = function() {
    function FunctionDeclaration(id, params, body, generator) {
        this.type = Syntax.FunctionDeclaration;
        this.id = id;
        this.params = params;
        this.body = body;
        this.generator = generator;
        this.expression = false;
        this.async = false;
    }
    return FunctionDeclaration;
}();
var FunctionExpression = function() {
    function FunctionExpression(id, params, body, generator) {
        this.type = Syntax.FunctionExpression;
        this.id = id;
        this.params = params;
        this.body = body;
        this.generator = generator;
        this.expression = false;
        this.async = false;
    }
    return FunctionExpression;
}();
var Identifier = function() {
    function Identifier(name) {
        this.type = Syntax.Identifier;
        this.name = name;
    }
    return Identifier;
}();
var IfStatement = function() {
    function IfStatement(test, consequent, alternate) {
        this.type = Syntax.IfStatement;
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    return IfStatement;
}();
var Import = function() {
    function Import() {
        this.type = Syntax.Import;
    }
    return Import;
}();
var ImportDeclaration = function() {
    function ImportDeclaration(specifiers, source) {
        this.type = Syntax.ImportDeclaration;
        this.specifiers = specifiers;
        this.source = source;
    }
    return ImportDeclaration;
}();
var ImportDefaultSpecifier = function() {
    function ImportDefaultSpecifier(local) {
        this.type = Syntax.ImportDefaultSpecifier;
        this.local = local;
    }
    return ImportDefaultSpecifier;
}();
var ImportNamespaceSpecifier = function() {
    function ImportNamespaceSpecifier(local) {
        this.type = Syntax.ImportNamespaceSpecifier;
        this.local = local;
    }
    return ImportNamespaceSpecifier;
}();
var ImportSpecifier = function() {
    function ImportSpecifier(local, imported) {
        this.type = Syntax.ImportSpecifier;
        this.local = local;
        this.imported = imported;
    }
    return ImportSpecifier;
}();
var LabeledStatement = function() {
    function LabeledStatement(label, body) {
        this.type = Syntax.LabeledStatement;
        this.label = label;
        this.body = body;
    }
    return LabeledStatement;
}();
var Literal = function() {
    function Literal(value, raw) {
        this.type = Syntax.Literal;
        this.value = value;
        this.raw = raw;
    }
    return Literal;
}();
var MetaProperty = function() {
    function MetaProperty(meta, property) {
        this.type = Syntax.MetaProperty;
        this.meta = meta;
        this.property = property;
    }
    return MetaProperty;
}();
var MethodDefinition = function() {
    function MethodDefinition(key, computed, value, kind, isStatic) {
        this.type = Syntax.MethodDefinition;
        this.key = key;
        this.computed = computed;
        this.value = value;
        this.kind = kind;
        this.static = isStatic;
    }
    return MethodDefinition;
}();
var Module = function() {
    function Module(body) {
        this.type = Syntax.Program;
        this.body = body;
        this.sourceType = 'module';
    }
    return Module;
}();
var NewExpression = function() {
    function NewExpression(callee, args) {
        this.type = Syntax.NewExpression;
        this.callee = callee;
        this.arguments = args;
    }
    return NewExpression;
}();
var ObjectExpression = function() {
    function ObjectExpression(properties) {
        this.type = Syntax.ObjectExpression;
        this.properties = properties;
    }
    return ObjectExpression;
}();
var ObjectPattern = function() {
    function ObjectPattern(properties) {
        this.type = Syntax.ObjectPattern;
        this.properties = properties;
    }
    return ObjectPattern;
}();
var Property = function() {
    function Property(kind, key, computed, value, method, shorthand) {
        this.type = Syntax.Property;
        this.key = key;
        this.computed = computed;
        this.value = value;
        this.kind = kind;
        this.method = method;
        this.shorthand = shorthand;
    }
    return Property;
}();
var RegexLiteral = function() {
    function RegexLiteral(value, raw, pattern, flags) {
        this.type = Syntax.Literal;
        this.value = value;
        this.raw = raw;
        this.regex = {
            pattern: pattern,
            flags: flags
        };
    }
    return RegexLiteral;
}();
var RestElement = function() {
    function RestElement(argument) {
        this.type = Syntax.RestElement;
        this.argument = argument;
    }
    return RestElement;
}();
var ReturnStatement = function() {
    function ReturnStatement(argument) {
        this.type = Syntax.ReturnStatement;
        this.argument = argument;
    }
    return ReturnStatement;
}();
var Script = function() {
    function Script(body) {
        this.type = Syntax.Program;
        this.body = body;
        this.sourceType = 'script';
    }
    return Script;
}();
var SequenceExpression = function() {
    function SequenceExpression(expressions) {
        this.type = Syntax.SequenceExpression;
        this.expressions = expressions;
    }
    return SequenceExpression;
}();
var SpreadElement = function() {
    function SpreadElement(argument) {
        this.type = Syntax.SpreadElement;
        this.argument = argument;
    }
    return SpreadElement;
}();
var StaticMemberExpression = function() {
    function StaticMemberExpression(object, property, optional) {
        this.type = Syntax.MemberExpression;
        this.computed = false;
        this.object = object;
        this.property = property;
        this.optional = optional;
    }
    return StaticMemberExpression;
}();
var Super = function() {
    function Super() {
        this.type = Syntax.Super;
    }
    return Super;
}();
var SwitchCase = function() {
    function SwitchCase(test, consequent) {
        this.type = Syntax.SwitchCase;
        this.test = test;
        this.consequent = consequent;
    }
    return SwitchCase;
}();
var SwitchStatement = function() {
    function SwitchStatement(discriminant, cases) {
        this.type = Syntax.SwitchStatement;
        this.discriminant = discriminant;
        this.cases = cases;
    }
    return SwitchStatement;
}();
var TaggedTemplateExpression = function() {
    function TaggedTemplateExpression(tag, quasi) {
        this.type = Syntax.TaggedTemplateExpression;
        this.tag = tag;
        this.quasi = quasi;
    }
    return TaggedTemplateExpression;
}();
var TemplateElement = function() {
    function TemplateElement(value, tail) {
        this.type = Syntax.TemplateElement;
        this.value = value;
        this.tail = tail;
    }
    return TemplateElement;
}();
var TemplateLiteral = function() {
    function TemplateLiteral(quasis, expressions) {
        this.type = Syntax.TemplateLiteral;
        this.quasis = quasis;
        this.expressions = expressions;
    }
    return TemplateLiteral;
}();
var ThisExpression = function() {
    function ThisExpression() {
        this.type = Syntax.ThisExpression;
    }
    return ThisExpression;
}();
var ThrowStatement = function() {
    function ThrowStatement(argument) {
        this.type = Syntax.ThrowStatement;
        this.argument = argument;
    }
    return ThrowStatement;
}();
var TryStatement = function() {
    function TryStatement(block, handler, finalizer) {
        this.type = Syntax.TryStatement;
        this.block = block;
        this.handler = handler;
        this.finalizer = finalizer;
    }
    return TryStatement;
}();
var UnaryExpression = function() {
    function UnaryExpression(operator, argument) {
        this.type = Syntax.UnaryExpression;
        this.operator = operator;
        this.argument = argument;
        this.prefix = true;
    }
    return UnaryExpression;
}();
var UpdateExpression = function() {
    function UpdateExpression(operator, argument, prefix) {
        this.type = Syntax.UpdateExpression;
        this.operator = operator;
        this.argument = argument;
        this.prefix = prefix;
    }
    return UpdateExpression;
}();
var VariableDeclaration = function() {
    function VariableDeclaration(declarations, kind) {
        this.type = Syntax.VariableDeclaration;
        this.declarations = declarations;
        this.kind = kind;
    }
    return VariableDeclaration;
}();
var VariableDeclarator = function() {
    function VariableDeclarator(id, init) {
        this.type = Syntax.VariableDeclarator;
        this.id = id;
        this.init = init;
    }
    return VariableDeclarator;
}();
var WhileStatement = function() {
    function WhileStatement(test, body) {
        this.type = Syntax.WhileStatement;
        this.test = test;
        this.body = body;
    }
    return WhileStatement;
}();
var WithStatement = function() {
    function WithStatement(object, body) {
        this.type = Syntax.WithStatement;
        this.object = object;
        this.body = body;
    }
    return WithStatement;
}();
var YieldExpression = function() {
    function YieldExpression(argument, delegate) {
        this.type = Syntax.YieldExpression;
        this.argument = argument;
        this.delegate = delegate;
    }
    return YieldExpression;
}();
function assert(condition, message) {
    if (!condition) {
        throw new Error('ASSERT: ' + message);
    }
}
var ErrorHandler = function() {
    function ErrorHandler() {
        this.errors = [];
        this.tolerant = false;
    }
    ErrorHandler.prototype.recordError = function(error) {
        this.errors.push(error);
    };
    ErrorHandler.prototype.tolerate = function(error) {
        if (this.tolerant) {
            this.recordError(error);
        } else {
            throw error;
        }
    };
    ErrorHandler.prototype.constructError = function(msg, column) {
        var error = new Error(msg);
        try {
            throw error;
        } catch (base) {
            if (Object.create && Object.defineProperty) {
                error = Object.create(base);
                Object.defineProperty(error, 'column', {
                    value: column
                });
            }
        }
        return error;
    };
    ErrorHandler.prototype.createError = function(index, line, col, description) {
        var msg = 'Line ' + line + ': ' + description;
        var error = this.constructError(msg, col);
        error.index = index;
        error.lineNumber = line;
        error.description = description;
        return error;
    };
    ErrorHandler.prototype.throwError = function(index, line, col, description) {
        throw this.createError(index, line, col, description);
    };
    ErrorHandler.prototype.tolerateError = function(index, line, col, description) {
        var error = this.createError(index, line, col, description);
        if (this.tolerant) {
            this.recordError(error);
        } else {
            throw error;
        }
    };
    return ErrorHandler;
}();
var Messages = {
    AsyncFunctionInSingleStatementContext: 'Async functions can only be declared at the top level or inside a block.',
    BadImportCallArity: 'Unexpected token',
    BadGetterArity: 'Getter must not have any formal parameters',
    BadSetterArity: 'Setter must have exactly one formal parameter',
    BadSetterRestParameter: 'Setter function argument must not be a rest parameter',
    CannotUseImportMetaOutsideAModule: 'Cannot use \'import.meta\' outside a module',
    ConstructorIsAsync: 'Class constructor may not be an async method',
    ConstructorSpecialMethod: 'Class constructor may not be an accessor',
    DeclarationMissingInitializer: 'Missing initializer in %0 declaration',
    DefaultRestParameter: 'Unexpected token =',
    DefaultRestProperty: 'Unexpected token =',
    DuplicateBinding: 'Duplicate binding %0',
    DuplicateConstructor: 'A class may only have one constructor',
    DuplicateParameter: 'Duplicate parameter name not allowed in this context',
    DuplicateProtoProperty: 'Duplicate __proto__ fields are not allowed in object literals',
    ForInOfLoopInitializer: '%0 loop variable declaration may not have an initializer',
    GeneratorInLegacyContext: 'Generator declarations are not allowed in legacy contexts',
    IllegalBreak: 'Illegal break statement',
    IllegalContinue: 'Illegal continue statement',
    IllegalExportDeclaration: 'Unexpected token',
    IllegalImportDeclaration: 'Unexpected token',
    IllegalLanguageModeDirective: 'Illegal \'use strict\' directive in function with non-simple parameter list',
    IllegalReturn: 'Illegal return statement',
    InvalidEscapedReservedWord: 'Keyword must not contain escaped characters',
    InvalidHexEscapeSequence: 'Invalid hexadecimal escape sequence',
    InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
    InvalidLHSInForIn: 'Invalid left-hand side in for-in',
    InvalidLHSInForLoop: 'Invalid left-hand side in for-loop',
    InvalidModuleSpecifier: 'Unexpected token',
    InvalidRegExp: 'Invalid regular expression',
    InvalidTaggedTemplateOnOptionalChain: 'Invalid tagged template on optional chain',
    InvalidUnicodeEscapeSequence: 'Invalid Unicode escape sequence',
    LetInLexicalBinding: 'let is disallowed as a lexically bound name',
    MissingFromClause: 'Unexpected token',
    MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
    NewlineAfterThrow: 'Illegal newline after throw',
    NoAsAfterImportNamespace: 'Unexpected token',
    NoCatchOrFinally: 'Missing catch or finally after try',
    ParameterAfterRestParameter: 'Rest parameter must be last formal parameter',
    PropertyAfterRestProperty: 'Unexpected token',
    Redeclaration: '%0 \'%1\' has already been declared',
    StaticPrototype: 'Classes may not have static property named prototype',
    StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
    StrictDelete: 'Delete of an unqualified identifier in strict mode.',
    StrictFunction: 'In strict mode code, functions can only be declared at top level or inside a block',
    StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
    StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
    StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
    StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
    StrictModeWith: 'Strict mode code may not include a with statement',
    StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
    StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
    StrictReservedWord: 'Use of future reserved word in strict mode',
    StrictVarName: 'Variable name may not be eval or arguments in strict mode',
    TemplateOctalLiteral: 'Octal literals are not allowed in template strings.',
    TemplateEscape89: '\\8 and \\9 are not allowed in template strings.',
    UnexpectedEOS: 'Unexpected end of input',
    UnexpectedIdentifier: 'Unexpected identifier',
    UnexpectedNumber: 'Unexpected number',
    UnexpectedReserved: 'Unexpected reserved word',
    UnexpectedString: 'Unexpected string',
    UnexpectedSuper: '\'super\' keyword unexpected here',
    UnexpectedTemplate: 'Unexpected quasi %0',
    UnexpectedToken: 'Unexpected token %0',
    UnexpectedTokenIllegal: 'Unexpected token ILLEGAL',
    UnknownLabel: 'Undefined label \'%0\'',
    UnterminatedRegExp: 'Invalid regular expression: missing /'
};
function hexValue(ch) {
    return '0123456789abcdef'.indexOf(ch.toLowerCase());
}
function octalValue(ch) {
    return '01234567'.indexOf(ch);
}
var Scanner = function() {
    function Scanner(code, handler) {
        this.source = code;
        this.errorHandler = handler;
        this.trackComment = false;
        this.isModule = false;
        this.length = code.length;
        this.index = 0;
        this.lineNumber = code.length > 0 ? 1 : 0;
        this.lineStart = 0;
        this.curlyStack = [];
    }
    Scanner.prototype.saveState = function() {
        return {
            index: this.index,
            lineNumber: this.lineNumber,
            lineStart: this.lineStart,
            curlyStack: this.curlyStack.slice()
        };
    };
    Scanner.prototype.restoreState = function(state) {
        this.index = state.index;
        this.lineNumber = state.lineNumber;
        this.lineStart = state.lineStart;
        this.curlyStack = state.curlyStack;
    };
    Scanner.prototype.eof = function() {
        return this.index >= this.length;
    };
    Scanner.prototype.throwUnexpectedToken = function(message) {
        if (message === void 0) {
            message = Messages.UnexpectedTokenIllegal;
        }
        return this.errorHandler.throwError(this.index, this.lineNumber, this.index - this.lineStart + 1, message);
    };
    Scanner.prototype.tolerateUnexpectedToken = function(message) {
        if (message === void 0) {
            message = Messages.UnexpectedTokenIllegal;
        }
        this.errorHandler.tolerateError(this.index, this.lineNumber, this.index - this.lineStart + 1, message);
    };
    Scanner.prototype.skipSingleLineComment = function(offset) {
        var comments = [];
        var start, loc;
        if (this.trackComment) {
            comments = [];
            start = this.index - offset;
            loc = {
                start: {
                    line: this.lineNumber,
                    column: this.index - this.lineStart - offset
                },
                end: {}
            };
        }
        while(!this.eof()){
            var ch = this.source.charCodeAt(this.index);
            ++this.index;
            if (Character.isLineTerminator(ch)) {
                if (this.trackComment) {
                    loc.end = {
                        line: this.lineNumber,
                        column: this.index - this.lineStart - 1
                    };
                    var entry = {
                        multiLine: false,
                        slice: [
                            start + offset,
                            this.index - 1
                        ],
                        range: [
                            start,
                            this.index - 1
                        ],
                        loc: loc
                    };
                    comments.push(entry);
                }
                if (ch === 13 && this.source.charCodeAt(this.index) === 10) {
                    ++this.index;
                }
                ++this.lineNumber;
                this.lineStart = this.index;
                return comments;
            }
        }
        if (this.trackComment) {
            loc.end = {
                line: this.lineNumber,
                column: this.index - this.lineStart
            };
            var entry = {
                multiLine: false,
                slice: [
                    start + offset,
                    this.index
                ],
                range: [
                    start,
                    this.index
                ],
                loc: loc
            };
            comments.push(entry);
        }
        return comments;
    };
    Scanner.prototype.skipMultiLineComment = function() {
        var comments = [];
        var start, loc;
        if (this.trackComment) {
            comments = [];
            start = this.index - 2;
            loc = {
                start: {
                    line: this.lineNumber,
                    column: this.index - this.lineStart - 2
                },
                end: {}
            };
        }
        while(!this.eof()){
            var ch = this.source.charCodeAt(this.index);
            if (Character.isLineTerminator(ch)) {
                if (ch === 0x0D && this.source.charCodeAt(this.index + 1) === 0x0A) {
                    ++this.index;
                }
                ++this.lineNumber;
                ++this.index;
                this.lineStart = this.index;
            } else if (ch === 0x2A) {
                if (this.source.charCodeAt(this.index + 1) === 0x2F) {
                    this.index += 2;
                    if (this.trackComment) {
                        loc.end = {
                            line: this.lineNumber,
                            column: this.index - this.lineStart
                        };
                        var entry = {
                            multiLine: true,
                            slice: [
                                start + 2,
                                this.index - 2
                            ],
                            range: [
                                start,
                                this.index
                            ],
                            loc: loc
                        };
                        comments.push(entry);
                    }
                    return comments;
                }
                ++this.index;
            } else {
                ++this.index;
            }
        }
        if (this.trackComment) {
            loc.end = {
                line: this.lineNumber,
                column: this.index - this.lineStart
            };
            var entry = {
                multiLine: true,
                slice: [
                    start + 2,
                    this.index
                ],
                range: [
                    start,
                    this.index
                ],
                loc: loc
            };
            comments.push(entry);
        }
        this.tolerateUnexpectedToken();
        return comments;
    };
    Scanner.prototype.scanComments = function() {
        var comments;
        if (this.trackComment) {
            comments = [];
        }
        var start = this.index === 0;
        while(!this.eof()){
            var ch = this.source.charCodeAt(this.index);
            if (Character.isWhiteSpace(ch)) {
                ++this.index;
            } else if (Character.isLineTerminator(ch)) {
                ++this.index;
                if (ch === 0x0D && this.source.charCodeAt(this.index) === 0x0A) {
                    ++this.index;
                }
                ++this.lineNumber;
                this.lineStart = this.index;
                start = true;
            } else if (ch === 0x2F) {
                ch = this.source.charCodeAt(this.index + 1);
                if (ch === 0x2F) {
                    this.index += 2;
                    var comment = this.skipSingleLineComment(2);
                    if (this.trackComment) {
                        comments = comments.concat(comment);
                    }
                    start = true;
                } else if (ch === 0x2A) {
                    this.index += 2;
                    var comment = this.skipMultiLineComment();
                    if (this.trackComment) {
                        comments = comments.concat(comment);
                    }
                } else {
                    break;
                }
            } else if (start && ch === 0x2D) {
                if (this.source.charCodeAt(this.index + 1) === 0x2D && this.source.charCodeAt(this.index + 2) === 0x3E) {
                    this.index += 3;
                    var comment = this.skipSingleLineComment(3);
                    if (this.trackComment) {
                        comments = comments.concat(comment);
                    }
                } else {
                    break;
                }
            } else if (ch === 0x3C && !this.isModule) {
                if (this.source.slice(this.index + 1, this.index + 4) === '!--') {
                    this.index += 4;
                    var comment = this.skipSingleLineComment(4);
                    if (this.trackComment) {
                        comments = comments.concat(comment);
                    }
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        return comments;
    };
    Scanner.prototype.isFutureReservedWord = function(id) {
        switch(id){
            case 'enum':
            case 'export':
            case 'import':
            case 'super':
                return true;
            default:
                return false;
        }
    };
    Scanner.prototype.isStrictModeReservedWord = function(id) {
        switch(id){
            case 'implements':
            case 'interface':
            case 'package':
            case 'private':
            case 'protected':
            case 'public':
            case 'static':
            case 'yield':
            case 'let':
                return true;
            default:
                return false;
        }
    };
    Scanner.prototype.isRestrictedWord = function(id) {
        return id === 'eval' || id === 'arguments';
    };
    Scanner.prototype.isKeyword = function(id) {
        switch(id.length){
            case 2:
                return id === 'if' || id === 'in' || id === 'do';
            case 3:
                return id === 'var' || id === 'for' || id === 'new' || id === 'try' || id === 'let';
            case 4:
                return id === 'this' || id === 'else' || id === 'case' || id === 'void' || id === 'with' || id === 'enum';
            case 5:
                return id === 'while' || id === 'break' || id === 'catch' || id === 'throw' || id === 'const' || id === 'yield' || id === 'class' || id === 'super';
            case 6:
                return id === 'return' || id === 'typeof' || id === 'delete' || id === 'switch' || id === 'export' || id === 'import';
            case 7:
                return id === 'default' || id === 'finally' || id === 'extends';
            case 8:
                return id === 'function' || id === 'continue' || id === 'debugger';
            case 10:
                return id === 'instanceof';
            default:
                return false;
        }
    };
    Scanner.prototype.codePointAt = function(i) {
        var cp = this.source.charCodeAt(i);
        if (cp >= 0xD800 && cp <= 0xDBFF) {
            var second = this.source.charCodeAt(i + 1);
            if (second >= 0xDC00 && second <= 0xDFFF) {
                var first = cp;
                cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
        }
        return cp;
    };
    Scanner.prototype.scanHexEscape = function(prefix) {
        var len = prefix === 'u' ? 4 : 2;
        var code = 0;
        for(var i = 0; i < len; ++i){
            if (!this.eof() && Character.isHexDigit(this.source.charCodeAt(this.index))) {
                code = code * 16 + hexValue(this.source[this.index++]);
            } else {
                return null;
            }
        }
        return String.fromCharCode(code);
    };
    Scanner.prototype.tryToScanUnicodeCodePointEscape = function() {
        var ch = this.source[this.index];
        var code = 0;
        if (ch === '}') {
            return null;
        }
        while(!this.eof()){
            ch = this.source[this.index++];
            if (!Character.isHexDigit(ch.charCodeAt(0))) {
                break;
            }
            code = code * 16 + hexValue(ch);
        }
        if (code > 0x10FFFF || ch !== '}') {
            return null;
        }
        return Character.fromCodePoint(code);
    };
    Scanner.prototype.scanUnicodeCodePointEscape = function() {
        var result = this.tryToScanUnicodeCodePointEscape();
        if (result === null) {
            return this.throwUnexpectedToken();
        }
        return result;
    };
    Scanner.prototype.getIdentifier = function() {
        var start = this.index++;
        while(!this.eof()){
            var ch = this.source.charCodeAt(this.index);
            if (ch === 0x5C) {
                this.index = start;
                return this.getComplexIdentifier();
            } else if (ch >= 0xD800 && ch < 0xDFFF) {
                this.index = start;
                return this.getComplexIdentifier();
            }
            if (Character.isIdentifierPart(ch)) {
                ++this.index;
            } else {
                break;
            }
        }
        return this.source.slice(start, this.index);
    };
    Scanner.prototype.getComplexIdentifier = function() {
        var cp = this.codePointAt(this.index);
        var id = Character.fromCodePoint(cp);
        this.index += id.length;
        var ch;
        if (cp === 0x5C) {
            if (this.source.charCodeAt(this.index) !== 0x75) {
                this.throwUnexpectedToken();
            }
            ++this.index;
            if (this.source[this.index] === '{') {
                ++this.index;
                ch = this.scanUnicodeCodePointEscape();
            } else {
                ch = this.scanHexEscape('u');
                if (ch === null || ch === '\\' || !Character.isIdentifierStart(ch.charCodeAt(0))) {
                    this.throwUnexpectedToken();
                }
            }
            id = ch;
        }
        while(!this.eof()){
            cp = this.codePointAt(this.index);
            if (!Character.isIdentifierPart(cp)) {
                break;
            }
            ch = Character.fromCodePoint(cp);
            id += ch;
            this.index += ch.length;
            if (cp === 0x5C) {
                id = id.substr(0, id.length - 1);
                if (this.source.charCodeAt(this.index) !== 0x75) {
                    this.throwUnexpectedToken();
                }
                ++this.index;
                if (this.source[this.index] === '{') {
                    ++this.index;
                    ch = this.scanUnicodeCodePointEscape();
                } else {
                    ch = this.scanHexEscape('u');
                    if (ch === null || ch === '\\' || !Character.isIdentifierPart(ch.charCodeAt(0))) {
                        this.throwUnexpectedToken();
                    }
                }
                id += ch;
            }
        }
        return id;
    };
    Scanner.prototype.octalToDecimal = function(ch) {
        var octal = ch !== '0';
        var code = octalValue(ch);
        if (!this.eof() && Character.isOctalDigit(this.source.charCodeAt(this.index))) {
            octal = true;
            code = code * 8 + octalValue(this.source[this.index++]);
            if ('0123'.indexOf(ch) >= 0 && !this.eof() && Character.isOctalDigit(this.source.charCodeAt(this.index))) {
                code = code * 8 + octalValue(this.source[this.index++]);
            }
        }
        return {
            code: code,
            octal: octal
        };
    };
    Scanner.prototype.scanIdentifier = function() {
        var type;
        var start = this.index;
        var id = this.source.charCodeAt(start) === 0x5C ? this.getComplexIdentifier() : this.getIdentifier();
        if (id.length === 1) {
            type = 3;
        } else if (this.isKeyword(id)) {
            type = 4;
        } else if (id === 'null') {
            type = 5;
        } else if (id === 'true' || id === 'false') {
            type = 1;
        } else {
            type = 3;
        }
        if (type !== 3 && start + id.length !== this.index) {
            var restore = this.index;
            this.index = start;
            this.tolerateUnexpectedToken(Messages.InvalidEscapedReservedWord);
            this.index = restore;
        }
        return {
            type: type,
            value: id,
            lineNumber: this.lineNumber,
            lineStart: this.lineStart,
            start: start,
            end: this.index
        };
    };
    Scanner.prototype.scanPunctuator = function() {
        var start = this.index;
        var str = this.source[this.index];
        switch(str){
            case '(':
            case '{':
                if (str === '{') {
                    this.curlyStack.push('{');
                }
                ++this.index;
                break;
            case '.':
                ++this.index;
                if (this.source[this.index] === '.' && this.source[this.index + 1] === '.') {
                    this.index += 2;
                    str = '...';
                }
                break;
            case '}':
                ++this.index;
                this.curlyStack.pop();
                break;
            case '?':
                ++this.index;
                if (this.source[this.index] === '?') {
                    ++this.index;
                    str = '??';
                }
                if (this.source[this.index] === '.' && !/^\d$/.test(this.source[this.index + 1])) {
                    ++this.index;
                    str = '?.';
                }
                break;
            case ')':
            case ';':
            case ',':
            case '[':
            case ']':
            case ':':
            case '~':
                ++this.index;
                break;
            default:
                str = this.source.substr(this.index, 4);
                if (str === '>>>=') {
                    this.index += 4;
                } else {
                    str = str.substr(0, 3);
                    if (str === '===' || str === '!==' || str === '>>>' || str === '<<=' || str === '>>=' || str === '**=') {
                        this.index += 3;
                    } else {
                        str = str.substr(0, 2);
                        if (str === '&&' || str === '||' || str === '??' || str === '==' || str === '!=' || str === '+=' || str === '-=' || str === '*=' || str === '/=' || str === '++' || str === '--' || str === '<<' || str === '>>' || str === '&=' || str === '|=' || str === '^=' || str === '%=' || str === '<=' || str === '>=' || str === '=>' || str === '**') {
                            this.index += 2;
                        } else {
                            str = this.source[this.index];
                            if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
                                ++this.index;
                            }
                        }
                    }
                }
        }
        if (this.index === start) {
            this.throwUnexpectedToken();
        }
        return {
            type: 7,
            value: str,
            lineNumber: this.lineNumber,
            lineStart: this.lineStart,
            start: start,
            end: this.index
        };
    };
    Scanner.prototype.scanHexLiteral = function(start) {
        var num = '';
        while(!this.eof()){
            if (!Character.isHexDigit(this.source.charCodeAt(this.index))) {
                break;
            }
            num += this.source[this.index++];
        }
        if (num.length === 0) {
            this.throwUnexpectedToken();
        }
        if (Character.isIdentifierStart(this.source.charCodeAt(this.index))) {
            this.throwUnexpectedToken();
        }
        return {
            type: 6,
            value: parseInt('0x' + num, 16),
            lineNumber: this.lineNumber,
            lineStart: this.lineStart,
            start: start,
            end: this.index
        };
    };
    Scanner.prototype.scanBinaryLiteral = function(start) {
        var num = '';
        var ch;
        while(!this.eof()){
            ch = this.source[this.index];
            if (ch !== '0' && ch !== '1') {
                break;
            }
            num += this.source[this.index++];
        }
        if (num.length === 0) {
            this.throwUnexpectedToken();
        }
        if (!this.eof()) {
            ch = this.source.charCodeAt(this.index);
            if (Character.isIdentifierStart(ch) || Character.isDecimalDigit(ch)) {
                this.throwUnexpectedToken();
            }
        }
        return {
            type: 6,
            value: parseInt(num, 2),
            lineNumber: this.lineNumber,
            lineStart: this.lineStart,
            start: start,
            end: this.index
        };
    };
    Scanner.prototype.scanOctalLiteral = function(prefix, start) {
        var num = '';
        var octal = false;
        if (Character.isOctalDigit(prefix.charCodeAt(0))) {
            octal = true;
            num = '0' + this.source[this.index++];
        } else {
            ++this.index;
        }
        while(!this.eof()){
            if (!Character.isOctalDigit(this.source.charCodeAt(this.index))) {
                break;
            }
            num += this.source[this.index++];
        }
        if (!octal && num.length === 0) {
            this.throwUnexpectedToken();
        }
        if (Character.isIdentifierStart(this.source.charCodeAt(this.index)) || Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
            this.throwUnexpectedToken();
        }
        return {
            type: 6,
            value: parseInt(num, 8),
            octal: octal,
            lineNumber: this.lineNumber,
            lineStart: this.lineStart,
            start: start,
            end: this.index
        };
    };
    Scanner.prototype.isImplicitOctalLiteral = function() {
        for(var i = this.index + 1; i < this.length; ++i){
            var ch = this.source[i];
            if (ch === '8' || ch === '9') {
                return false;
            }
            if (!Character.isOctalDigit(ch.charCodeAt(0))) {
                return true;
            }
        }
        return true;
    };
    Scanner.prototype.scanNumericLiteral = function() {
        var start = this.index;
        var ch = this.source[start];
        assert(Character.isDecimalDigit(ch.charCodeAt(0)) || ch === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        var num = '';
        if (ch !== '.') {
            num = this.source[this.index++];
            ch = this.source[this.index];
            if (num === '0') {
                if (ch === 'x' || ch === 'X') {
                    ++this.index;
                    return this.scanHexLiteral(start);
                }
                if (ch === 'b' || ch === 'B') {
                    ++this.index;
                    return this.scanBinaryLiteral(start);
                }
                if (ch === 'o' || ch === 'O') {
                    return this.scanOctalLiteral(ch, start);
                }
                if (ch && Character.isOctalDigit(ch.charCodeAt(0))) {
                    if (this.isImplicitOctalLiteral()) {
                        return this.scanOctalLiteral(ch, start);
                    }
                }
            }
            while(Character.isDecimalDigit(this.source.charCodeAt(this.index))){
                num += this.source[this.index++];
            }
            ch = this.source[this.index];
        }
        if (ch === '.') {
            num += this.source[this.index++];
            while(Character.isDecimalDigit(this.source.charCodeAt(this.index))){
                num += this.source[this.index++];
            }
            ch = this.source[this.index];
        }
        if (ch === 'e' || ch === 'E') {
            num += this.source[this.index++];
            ch = this.source[this.index];
            if (ch === '+' || ch === '-') {
                num += this.source[this.index++];
            }
            if (Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                while(Character.isDecimalDigit(this.source.charCodeAt(this.index))){
                    num += this.source[this.index++];
                }
            } else {
                this.throwUnexpectedToken();
            }
        }
        if (Character.isIdentifierStart(this.source.charCodeAt(this.index))) {
            this.throwUnexpectedToken();
        }
        return {
            type: 6,
            value: parseFloat(num),
            lineNumber: this.lineNumber,
            lineStart: this.lineStart,
            start: start,
            end: this.index
        };
    };
    Scanner.prototype.scanStringLiteral = function() {
        var start = this.index;
        var quote = this.source[start];
        assert(quote === '\'' || quote === '"', 'String literal must starts with a quote');
        ++this.index;
        var octal = false;
        var str = '';
        while(!this.eof()){
            var ch = this.source[this.index++];
            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = this.source[this.index++];
                if (!ch || !Character.isLineTerminator(ch.charCodeAt(0))) {
                    switch(ch){
                        case 'u':
                            if (this.source[this.index] === '{') {
                                ++this.index;
                                str += this.scanUnicodeCodePointEscape();
                            } else {
                                var unescapedChar = this.scanHexEscape(ch);
                                if (unescapedChar === null) {
                                    this.throwUnexpectedToken();
                                }
                                str += unescapedChar;
                            }
                            break;
                        case 'x':
                            var unescaped = this.scanHexEscape(ch);
                            if (unescaped === null) {
                                this.throwUnexpectedToken(Messages.InvalidHexEscapeSequence);
                            }
                            str += unescaped;
                            break;
                        case 'n':
                            str += '\n';
                            break;
                        case 'r':
                            str += '\r';
                            break;
                        case 't':
                            str += '\t';
                            break;
                        case 'b':
                            str += '\b';
                            break;
                        case 'f':
                            str += '\f';
                            break;
                        case 'v':
                            str += '\x0B';
                            break;
                        case '8':
                        case '9':
                            str += ch;
                            this.tolerateUnexpectedToken();
                            break;
                        default:
                            if (ch && Character.isOctalDigit(ch.charCodeAt(0))) {
                                var octToDec = this.octalToDecimal(ch);
                                octal = octToDec.octal || octal;
                                str += String.fromCharCode(octToDec.code);
                            } else {
                                str += ch;
                            }
                            break;
                    }
                } else {
                    ++this.lineNumber;
                    if (ch === '\r' && this.source[this.index] === '\n') {
                        ++this.index;
                    }
                    this.lineStart = this.index;
                }
            } else if (Character.isLineTerminator(ch.charCodeAt(0))) {
                break;
            } else {
                str += ch;
            }
        }
        if (quote !== '') {
            this.index = start;
            this.throwUnexpectedToken();
        }
        return {
            type: 8,
            value: str,
            octal: octal,
            lineNumber: this.lineNumber,
            lineStart: this.lineStart,
            start: start,
            end: this.index
        };
    };
    Scanner.prototype.scanTemplate = function() {
        var cooked = '';
        var terminated = false;
        var start = this.index;
        var head = this.source[start] === '`';
        var tail = false;
        var notEscapeSequenceHead = null;
        var rawOffset = 2;
        ++this.index;
        while(!this.eof()){
            var ch = this.source[this.index++];
            if (ch === '`') {
                rawOffset = 1;
                tail = true;
                terminated = true;
                break;
            } else if (ch === '$') {
                if (this.source[this.index] === '{') {
                    this.curlyStack.push('${');
                    ++this.index;
                    terminated = true;
                    break;
                }
                cooked += ch;
            } else if (notEscapeSequenceHead !== null) {
                continue;
            } else if (ch === '\\') {
                ch = this.source[this.index++];
                if (!Character.isLineTerminator(ch.charCodeAt(0))) {
                    switch(ch){
                        case 'n':
                            cooked += '\n';
                            break;
                        case 'r':
                            cooked += '\r';
                            break;
                        case 't':
                            cooked += '\t';
                            break;
                        case 'u':
                            if (this.source[this.index] === '{') {
                                ++this.index;
                                var unicodeCodePointEscape = this.tryToScanUnicodeCodePointEscape();
                                if (unicodeCodePointEscape === null) {
                                    notEscapeSequenceHead = 'u';
                                } else {
                                    cooked += unicodeCodePointEscape;
                                }
                            } else {
                                var unescapedChar = this.scanHexEscape(ch);
                                if (unescapedChar === null) {
                                    notEscapeSequenceHead = 'u';
                                } else {
                                    cooked += unescapedChar;
                                }
                            }
                            break;
                        case 'x':
                            var unescaped = this.scanHexEscape(ch);
                            if (unescaped === null) {
                                notEscapeSequenceHead = 'x';
                            } else {
                                cooked += unescaped;
                            }
                            break;
                        case 'b':
                            cooked += '\b';
                            break;
                        case 'f':
                            cooked += '\f';
                            break;
                        case 'v':
                            cooked += '\v';
                            break;
                        default:
                            if (ch === '0') {
                                if (Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                                    notEscapeSequenceHead = '0';
                                } else {
                                    cooked += '\0';
                                }
                            } else if (Character.isDecimalDigitChar(ch)) {
                                notEscapeSequenceHead = ch;
                            } else {
                                cooked += ch;
                            }
                            break;
                    }
                } else {
                    ++this.lineNumber;
                    if (ch === '\r' && this.source[this.index] === '\n') {
                        ++this.index;
                    }
                    this.lineStart = this.index;
                }
            } else if (Character.isLineTerminator(ch.charCodeAt(0))) {
                ++this.lineNumber;
                if (ch === '\r' && this.source[this.index] === '\n') {
                    ++this.index;
                }
                this.lineStart = this.index;
                cooked += '\n';
            } else {
                cooked += ch;
            }
        }
        if (!terminated) {
            this.throwUnexpectedToken();
        }
        if (!head) {
            this.curlyStack.pop();
        }
        return {
            type: 10,
            value: this.source.slice(start + 1, this.index - rawOffset),
            cooked: notEscapeSequenceHead === null ? cooked : null,
            head: head,
            tail: tail,
            notEscapeSequenceHead: notEscapeSequenceHead,
            lineNumber: this.lineNumber,
            lineStart: this.lineStart,
            start: start,
            end: this.index
        };
    };
    Scanner.prototype.testRegExp = function(pattern, flags) {
        var _this = this;
        var astralSubstitute = '\uFFFF';
        var tmp = pattern;
        if (flags.indexOf('u') >= 0) {
            tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g, function($0, $1, $2) {
                var codePoint = parseInt($1 || $2, 16);
                if (codePoint > 0x10FFFF) {
                    _this.throwUnexpectedToken(Messages.InvalidRegExp);
                }
                if (codePoint <= 0xFFFF) {
                    return String.fromCharCode(codePoint);
                }
                return astralSubstitute;
            }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, astralSubstitute);
        }
        try {
            RegExp(tmp);
        } catch (e) {
            this.throwUnexpectedToken(Messages.InvalidRegExp);
        }
        try {
            return new RegExp(pattern, flags);
        } catch (exception) {
            return null;
        }
    };
    Scanner.prototype.scanRegExpBody = function() {
        var ch = this.source[this.index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        var str = this.source[this.index++];
        var classMarker = false;
        var terminated = false;
        while(!this.eof()){
            ch = this.source[this.index++];
            str += ch;
            if (ch === '\\') {
                ch = this.source[this.index++];
                if (Character.isLineTerminator(ch.charCodeAt(0))) {
                    this.throwUnexpectedToken(Messages.UnterminatedRegExp);
                }
                str += ch;
            } else if (Character.isLineTerminator(ch.charCodeAt(0))) {
                this.throwUnexpectedToken(Messages.UnterminatedRegExp);
            } else if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                }
            }
        }
        if (!terminated) {
            this.throwUnexpectedToken(Messages.UnterminatedRegExp);
        }
        return str.substr(1, str.length - 2);
    };
    Scanner.prototype.scanRegExpFlags = function() {
        var str = '';
        var flags = '';
        while(!this.eof()){
            var ch = this.source[this.index];
            if (!Character.isIdentifierPart(ch.charCodeAt(0))) {
                break;
            }
            ++this.index;
            if (ch === '\\' && !this.eof()) {
                ch = this.source[this.index];
                if (ch === 'u') {
                    ++this.index;
                    var restore = this.index;
                    var __char = this.scanHexEscape('u');
                    if (__char !== null) {
                        flags += __char;
                        for(str += '\\u'; restore < this.index; ++restore){
                            str += this.source[restore];
                        }
                    } else {
                        this.index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                    this.tolerateUnexpectedToken();
                } else {
                    str += '\\';
                    this.tolerateUnexpectedToken();
                }
            } else {
                flags += ch;
                str += ch;
            }
        }
        return flags;
    };
    Scanner.prototype.scanRegExp = function() {
        var start = this.index;
        var pattern = this.scanRegExpBody();
        var flags = this.scanRegExpFlags();
        var value = this.testRegExp(pattern, flags);
        return {
            type: 9,
            value: '',
            pattern: pattern,
            flags: flags,
            regex: value,
            lineNumber: this.lineNumber,
            lineStart: this.lineStart,
            start: start,
            end: this.index
        };
    };
    Scanner.prototype.lex = function() {
        if (this.eof()) {
            return {
                type: 2,
                value: '',
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: this.index,
                end: this.index
            };
        }
        var cp = this.source.charCodeAt(this.index);
        if (Character.isIdentifierStart(cp)) {
            return this.scanIdentifier();
        }
        if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
            return this.scanPunctuator();
        }
        if (cp === 0x27 || cp === 0x22) {
            return this.scanStringLiteral();
        }
        if (cp === 0x2E) {
            if (Character.isDecimalDigit(this.source.charCodeAt(this.index + 1))) {
                return this.scanNumericLiteral();
            }
            return this.scanPunctuator();
        }
        if (Character.isDecimalDigit(cp)) {
            return this.scanNumericLiteral();
        }
        if (cp === 0x60 || cp === 0x7D && this.curlyStack[this.curlyStack.length - 1] === '${') {
            return this.scanTemplate();
        }
        if (cp >= 0xD800 && cp < 0xDFFF) {
            if (Character.isIdentifierStart(this.codePointAt(this.index))) {
                return this.scanIdentifier();
            }
        }
        return this.scanPunctuator();
    };
    return Scanner;
}();
var TokenName = {};
TokenName[1] = 'Boolean';
TokenName[2] = '<end>';
TokenName[3] = 'Identifier';
TokenName[4] = 'Keyword';
TokenName[5] = 'Null';
TokenName[6] = 'Numeric';
TokenName[7] = 'Punctuator';
TokenName[8] = 'String';
TokenName[9] = 'RegularExpression';
TokenName[10] = 'Template';
var ArrowParameterPlaceHolder = 'ArrowParameterPlaceHolder';
var Parser = function() {
    function Parser(code, options, delegate) {
        if (options === void 0) {
            options = {};
        }
        this.config = {
            range: typeof options.range === 'boolean' && options.range,
            loc: typeof options.loc === 'boolean' && options.loc,
            source: null,
            tokens: typeof options.tokens === 'boolean' && options.tokens,
            comment: typeof options.comment === 'boolean' && options.comment,
            tolerant: typeof options.tolerant === 'boolean' && options.tolerant
        };
        if (this.config.loc && options.source && options.source !== null) {
            this.config.source = String(options.source);
        }
        this.delegate = delegate;
        this.errorHandler = new ErrorHandler();
        this.errorHandler.tolerant = this.config.tolerant;
        this.scanner = new Scanner(code, this.errorHandler);
        this.scanner.trackComment = this.config.comment;
        this.operatorPrecedence = {
            ')': 0,
            ';': 0,
            ',': 0,
            '=': 0,
            ']': 0,
            '??': 5,
            '||': 6,
            '&&': 7,
            '|': 8,
            '^': 9,
            '&': 10,
            '==': 11,
            '!=': 11,
            '===': 11,
            '!==': 11,
            '<': 12,
            '>': 12,
            '<=': 12,
            '>=': 12,
            '<<': 13,
            '>>': 13,
            '>>>': 13,
            '+': 14,
            '-': 14,
            '*': 15,
            '/': 15,
            '%': 15
        };
        this.lookahead = {
            type: 2,
            value: '',
            lineNumber: this.scanner.lineNumber,
            lineStart: 0,
            start: 0,
            end: 0
        };
        this.hasLineTerminator = false;
        this.context = {
            isModule: false,
            isAsync: false,
            allowIn: true,
            allowStrictDirective: true,
            allowYield: true,
            firstCoverInitializedNameError: null,
            isAssignmentTarget: false,
            isBindingElement: false,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            inClassConstructor: false,
            labelSet: {},
            strict: false
        };
        this.tokens = [];
        this.startMarker = {
            index: 0,
            line: this.scanner.lineNumber,
            column: 0
        };
        this.lastMarker = {
            index: 0,
            line: this.scanner.lineNumber,
            column: 0
        };
        this.nextToken();
        this.lastMarker = {
            index: this.scanner.index,
            line: this.scanner.lineNumber,
            column: this.scanner.index - this.scanner.lineStart
        };
    }
    Parser.prototype.throwError = function(messageFormat) {
        var values = [];
        for(var _i = 1; _i < arguments.length; _i++){
            values[_i - 1] = arguments[_i];
        }
        var args = values.slice();
        var msg = messageFormat.replace(/%(\d)/g, function(whole, idx) {
            assert(idx < args.length, 'Message reference must be in range');
            return args[idx];
        });
        var index = this.lastMarker.index;
        var line = this.lastMarker.line;
        var column = this.lastMarker.column + 1;
        throw this.errorHandler.createError(index, line, column, msg);
    };
    Parser.prototype.tolerateError = function(messageFormat) {
        var values = [];
        for(var _i = 1; _i < arguments.length; _i++){
            values[_i - 1] = arguments[_i];
        }
        var args = values.slice();
        var msg = messageFormat.replace(/%(\d)/g, function(whole, idx) {
            assert(idx < args.length, 'Message reference must be in range');
            return args[idx];
        });
        var index = this.lastMarker.index;
        var line = this.scanner.lineNumber;
        var column = this.lastMarker.column + 1;
        this.errorHandler.tolerateError(index, line, column, msg);
    };
    Parser.prototype.unexpectedTokenError = function(token, message) {
        var msg = message || Messages.UnexpectedToken;
        var value;
        if (token) {
            if (!message) {
                msg = token.type === 2 ? Messages.UnexpectedEOS : token.type === 3 ? Messages.UnexpectedIdentifier : token.type === 6 ? Messages.UnexpectedNumber : token.type === 8 ? Messages.UnexpectedString : token.type === 10 ? Messages.UnexpectedTemplate : Messages.UnexpectedToken;
                if (token.type === 4) {
                    if (this.scanner.isFutureReservedWord(token.value)) {
                        msg = Messages.UnexpectedReserved;
                    } else if (this.context.strict && this.scanner.isStrictModeReservedWord(token.value)) {
                        msg = Messages.StrictReservedWord;
                    }
                }
            }
            value = token.value;
        } else {
            value = 'ILLEGAL';
        }
        msg = msg.replace('%0', value);
        if (token && typeof token.lineNumber === 'number') {
            var index = token.start;
            var line = token.lineNumber;
            var lastMarkerLineStart = this.lastMarker.index - this.lastMarker.column;
            var column = token.start - lastMarkerLineStart + 1;
            return this.errorHandler.createError(index, line, column, msg);
        } else {
            var index = this.lastMarker.index;
            var line = this.lastMarker.line;
            var column = this.lastMarker.column + 1;
            return this.errorHandler.createError(index, line, column, msg);
        }
    };
    Parser.prototype.throwUnexpectedToken = function(token, message) {
        throw this.unexpectedTokenError(token, message);
    };
    Parser.prototype.tolerateUnexpectedToken = function(token, message) {
        this.errorHandler.tolerate(this.unexpectedTokenError(token, message));
    };
    Parser.prototype.tolerateInvalidLoopStatement = function() {
        if (this.matchKeyword("class") || this.matchKeyword("function")) {
            this.tolerateError(Messages.UnexpectedToken, this.lookahead);
        }
    };
    Parser.prototype.collectComments = function() {
        if (!this.config.comment) {
            this.scanner.scanComments();
        } else {
            var comments = this.scanner.scanComments();
            if (comments.length > 0 && this.delegate) {
                for(var i = 0; i < comments.length; ++i){
                    var e = comments[i];
                    var node = {
                        type: e.multiLine ? 'BlockComment' : 'LineComment',
                        value: this.scanner.source.slice(e.slice[0], e.slice[1])
                    };
                    if (this.config.range) {
                        node.range = e.range;
                    }
                    if (this.config.loc) {
                        node.loc = e.loc;
                    }
                    var metadata = {
                        start: {
                            line: e.loc.start.line,
                            column: e.loc.start.column,
                            offset: e.range[0]
                        },
                        end: {
                            line: e.loc.end.line,
                            column: e.loc.end.column,
                            offset: e.range[1]
                        }
                    };
                    this.delegate(node, metadata);
                }
            }
        }
    };
    Parser.prototype.getTokenRaw = function(token) {
        return this.scanner.source.slice(token.start, token.end);
    };
    Parser.prototype.convertToken = function(token) {
        var t = {
            type: TokenName[token.type],
            value: this.getTokenRaw(token)
        };
        if (this.config.range) {
            t.range = [
                token.start,
                token.end
            ];
        }
        if (this.config.loc) {
            t.loc = {
                start: {
                    line: this.startMarker.line,
                    column: this.startMarker.column
                },
                end: {
                    line: this.scanner.lineNumber,
                    column: this.scanner.index - this.scanner.lineStart
                }
            };
        }
        if (token.type === 9) {
            var pattern = token.pattern;
            var flags = token.flags;
            t.regex = {
                pattern: pattern,
                flags: flags
            };
        }
        return t;
    };
    Parser.prototype.nextToken = function() {
        var token = this.lookahead;
        this.lastMarker.index = this.scanner.index;
        this.lastMarker.line = this.scanner.lineNumber;
        this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
        this.collectComments();
        if (this.scanner.index !== this.startMarker.index) {
            this.startMarker.index = this.scanner.index;
            this.startMarker.line = this.scanner.lineNumber;
            this.startMarker.column = this.scanner.index - this.scanner.lineStart;
        }
        var next = this.scanner.lex();
        this.hasLineTerminator = token.lineNumber !== next.lineNumber;
        if (next && this.context.strict && next.type === 3) {
            if (this.scanner.isStrictModeReservedWord(next.value)) {
                next.type = 4;
            }
        }
        this.lookahead = next;
        if (this.config.tokens && next.type !== 2) {
            this.tokens.push(this.convertToken(next));
        }
        return token;
    };
    Parser.prototype.nextRegexToken = function() {
        this.collectComments();
        var token = this.scanner.scanRegExp();
        if (this.config.tokens) {
            this.tokens.pop();
            this.tokens.push(this.convertToken(token));
        }
        this.lookahead = token;
        this.nextToken();
        return token;
    };
    Parser.prototype.createNode = function() {
        return {
            index: this.startMarker.index,
            line: this.startMarker.line,
            column: this.startMarker.column
        };
    };
    Parser.prototype.startNode = function(token, lastLineStart) {
        if (lastLineStart === void 0) {
            lastLineStart = 0;
        }
        var column = token.start - token.lineStart;
        var line = token.lineNumber;
        if (column < 0) {
            column += lastLineStart;
            line--;
        }
        return {
            index: token.start,
            line: line,
            column: column
        };
    };
    Parser.prototype.finalize = function(marker, node) {
        if (this.config.range) {
            node.range = [
                marker.index,
                this.lastMarker.index
            ];
        }
        if (this.config.loc) {
            node.loc = {
                start: {
                    line: marker.line,
                    column: marker.column
                },
                end: {
                    line: this.lastMarker.line,
                    column: this.lastMarker.column
                }
            };
            if (this.config.source) {
                node.loc.source = this.config.source;
            }
        }
        if (this.delegate) {
            var metadata = {
                start: {
                    line: marker.line,
                    column: marker.column,
                    offset: marker.index
                },
                end: {
                    line: this.lastMarker.line,
                    column: this.lastMarker.column,
                    offset: this.lastMarker.index
                }
            };
            this.delegate(node, metadata);
        }
        return node;
    };
    Parser.prototype.expect = function(value) {
        var token = this.nextToken();
        if (token.type !== 7 || token.value !== value) {
            this.throwUnexpectedToken(token);
        }
    };
    Parser.prototype.expectCommaSeparator = function() {
        if (this.config.tolerant) {
            var token = this.lookahead;
            if (token.type === 7 && token.value === ',') {
                this.nextToken();
            } else if (token.type === 7 && token.value === ';') {
                this.nextToken();
                this.tolerateUnexpectedToken(token);
            } else {
                this.tolerateUnexpectedToken(token, Messages.UnexpectedToken);
            }
        } else {
            this.expect(',');
        }
    };
    Parser.prototype.expectKeyword = function(keyword) {
        var token = this.nextToken();
        if (token.type !== 4 || token.value !== keyword) {
            this.throwUnexpectedToken(token);
        }
    };
    Parser.prototype.match = function(value) {
        return this.lookahead.type === 7 && this.lookahead.value === value;
    };
    Parser.prototype.matchKeyword = function(keyword) {
        return this.lookahead.type === 4 && this.lookahead.value === keyword;
    };
    Parser.prototype.matchContextualKeyword = function(keyword) {
        return this.lookahead.type === 3 && this.lookahead.value === keyword;
    };
    Parser.prototype.matchAssign = function() {
        if (this.lookahead.type !== 7) {
            return false;
        }
        var op = this.lookahead.value;
        return op === '=' || op === '*=' || op === '**=' || op === '/=' || op === '%=' || op === '+=' || op === '-=' || op === '<<=' || op === '>>=' || op === '>>>=' || op === '&=' || op === '^=' || op === '|=';
    };
    Parser.prototype.isolateCoverGrammar = function(parseFunction) {
        var previousIsBindingElement = this.context.isBindingElement;
        var previousIsAssignmentTarget = this.context.isAssignmentTarget;
        var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
        this.context.isBindingElement = true;
        this.context.isAssignmentTarget = true;
        this.context.firstCoverInitializedNameError = null;
        var result = parseFunction.call(this);
        if (this.context.firstCoverInitializedNameError !== null) {
            this.throwUnexpectedToken(this.context.firstCoverInitializedNameError);
        }
        this.context.isBindingElement = previousIsBindingElement;
        this.context.isAssignmentTarget = previousIsAssignmentTarget;
        this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError;
        return result;
    };
    Parser.prototype.inheritCoverGrammar = function(parseFunction) {
        var previousIsBindingElement = this.context.isBindingElement;
        var previousIsAssignmentTarget = this.context.isAssignmentTarget;
        var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
        this.context.isBindingElement = true;
        this.context.isAssignmentTarget = true;
        this.context.firstCoverInitializedNameError = null;
        var result = parseFunction.call(this);
        this.context.isBindingElement = this.context.isBindingElement && previousIsBindingElement;
        this.context.isAssignmentTarget = this.context.isAssignmentTarget && previousIsAssignmentTarget;
        this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError || this.context.firstCoverInitializedNameError;
        return result;
    };
    Parser.prototype.consumeSemicolon = function() {
        if (this.match(';')) {
            this.nextToken();
        } else if (!this.hasLineTerminator) {
            if (this.lookahead.type !== 2 && !this.match('}')) {
                this.throwUnexpectedToken(this.lookahead);
            }
            this.lastMarker.index = this.startMarker.index;
            this.lastMarker.line = this.startMarker.line;
            this.lastMarker.column = this.startMarker.column;
        }
    };
    Parser.prototype.parsePrimaryExpression = function() {
        var node = this.createNode();
        var expr;
        var token, raw;
        switch(this.lookahead.type){
            case 3:
                if ((this.context.isModule || this.context.isAsync) && this.lookahead.value === 'await') {
                    this.tolerateUnexpectedToken(this.lookahead);
                }
                expr = this.matchAsyncFunction() ? this.parseFunctionExpression() : this.finalize(node, new Identifier(this.nextToken().value));
                break;
            case 6:
            case 8:
                if (this.context.strict && this.lookahead.octal) {
                    this.tolerateUnexpectedToken(this.lookahead, Messages.StrictOctalLiteral);
                }
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
                token = this.nextToken();
                raw = this.getTokenRaw(token);
                expr = this.finalize(node, new Literal(token.value, raw));
                break;
            case 1:
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
                token = this.nextToken();
                raw = this.getTokenRaw(token);
                expr = this.finalize(node, new Literal(token.value === 'true', raw));
                break;
            case 5:
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
                token = this.nextToken();
                raw = this.getTokenRaw(token);
                expr = this.finalize(node, new Literal(null, raw));
                break;
            case 10:
                expr = this.parseTemplateLiteral({
                    isTagged: false
                });
                break;
            case 7:
                switch(this.lookahead.value){
                    case '(':
                        this.context.isBindingElement = false;
                        expr = this.inheritCoverGrammar(this.parseGroupExpression);
                        break;
                    case '[':
                        expr = this.inheritCoverGrammar(this.parseArrayInitializer);
                        break;
                    case '{':
                        expr = this.inheritCoverGrammar(this.parseObjectInitializer);
                        break;
                    case '/':
                    case '/=':
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                        this.scanner.index = this.startMarker.index;
                        token = this.nextRegexToken();
                        raw = this.getTokenRaw(token);
                        expr = this.finalize(node, new RegexLiteral(token.regex, raw, token.pattern, token.flags));
                        break;
                    default:
                        expr = this.throwUnexpectedToken(this.nextToken());
                }
                break;
            case 4:
                if (!this.context.strict && this.context.allowYield && this.matchKeyword('yield')) {
                    expr = this.parseIdentifierName();
                } else if (!this.context.strict && this.matchKeyword('let')) {
                    expr = this.finalize(node, new Identifier(this.nextToken().value));
                } else {
                    this.context.isAssignmentTarget = false;
                    this.context.isBindingElement = false;
                    if (this.matchKeyword('function')) {
                        expr = this.parseFunctionExpression();
                    } else if (this.matchKeyword('this')) {
                        this.nextToken();
                        expr = this.finalize(node, new ThisExpression());
                    } else if (this.matchKeyword('class')) {
                        expr = this.parseClassExpression();
                    } else if (this.matchImportCall()) {
                        expr = this.parseImportCall();
                    } else if (this.matchImportMeta()) {
                        if (!this.context.isModule) {
                            this.tolerateUnexpectedToken(this.lookahead, Messages.CannotUseImportMetaOutsideAModule);
                        }
                        expr = this.parseImportMeta();
                    } else {
                        expr = this.throwUnexpectedToken(this.nextToken());
                    }
                }
                break;
            default:
                expr = this.throwUnexpectedToken(this.nextToken());
        }
        return expr;
    };
    Parser.prototype.parseSpreadElement = function() {
        var node = this.createNode();
        this.expect('...');
        var arg = this.inheritCoverGrammar(this.parseAssignmentExpression);
        return this.finalize(node, new SpreadElement(arg));
    };
    Parser.prototype.parseArrayInitializer = function() {
        var node = this.createNode();
        var elements = [];
        this.expect('[');
        while(!this.match(']')){
            if (this.match(',')) {
                this.nextToken();
                elements.push(null);
            } else if (this.match('...')) {
                var element = this.parseSpreadElement();
                if (!this.match(']')) {
                    this.context.isAssignmentTarget = false;
                    this.context.isBindingElement = false;
                    this.expect(',');
                }
                elements.push(element);
            } else {
                elements.push(this.inheritCoverGrammar(this.parseAssignmentExpression));
                if (!this.match(']')) {
                    this.expect(',');
                }
            }
        }
        this.expect(']');
        return this.finalize(node, new ArrayExpression(elements));
    };
    Parser.prototype.parsePropertyMethod = function(params) {
        this.context.isAssignmentTarget = false;
        this.context.isBindingElement = false;
        var previousStrict = this.context.strict;
        var previousAllowStrictDirective = this.context.allowStrictDirective;
        this.context.allowStrictDirective = params.simple;
        var body = this.isolateCoverGrammar(this.parseFunctionSourceElements);
        if (this.context.strict && params.firstRestricted) {
            this.tolerateUnexpectedToken(params.firstRestricted, params.message);
        }
        if (this.context.strict && params.stricted) {
            this.tolerateUnexpectedToken(params.stricted, params.message);
        }
        this.context.strict = previousStrict;
        this.context.allowStrictDirective = previousAllowStrictDirective;
        return body;
    };
    Parser.prototype.parsePropertyMethodFunction = function(isGenerator) {
        var node = this.createNode();
        var previousAllowYield = this.context.allowYield;
        this.context.allowYield = true;
        var params = this.parseFormalParameters();
        var method = this.parsePropertyMethod(params);
        this.context.allowYield = previousAllowYield;
        return this.finalize(node, new FunctionExpression(null, params.params, method, isGenerator));
    };
    Parser.prototype.parsePropertyMethodAsyncFunction = function(isGenerator) {
        var node = this.createNode();
        var previousAllowYield = this.context.allowYield;
        var previousIsAsync = this.context.isAsync;
        this.context.allowYield = false;
        this.context.isAsync = true;
        var params = this.parseFormalParameters();
        var method = this.parsePropertyMethod(params);
        this.context.allowYield = previousAllowYield;
        this.context.isAsync = previousIsAsync;
        return this.finalize(node, new AsyncFunctionExpression(null, params.params, method, isGenerator));
    };
    Parser.prototype.parseObjectPropertyKey = function() {
        var node = this.createNode();
        var token = this.nextToken();
        var key;
        switch(token.type){
            case 8:
            case 6:
                if (this.context.strict && token.octal) {
                    this.tolerateUnexpectedToken(token, Messages.StrictOctalLiteral);
                }
                var raw = this.getTokenRaw(token);
                key = this.finalize(node, new Literal(token.value, raw));
                break;
            case 3:
            case 1:
            case 5:
            case 4:
                key = this.finalize(node, new Identifier(token.value));
                break;
            case 7:
                if (token.value === '[') {
                    key = this.isolateCoverGrammar(this.parseAssignmentExpression);
                    this.expect(']');
                } else {
                    key = this.throwUnexpectedToken(token);
                }
                break;
            default:
                key = this.throwUnexpectedToken(token);
        }
        return key;
    };
    Parser.prototype.isPropertyKey = function(key, value) {
        return key.type === Syntax.Identifier && key.name === value || key.type === Syntax.Literal && key.value === value;
    };
    Parser.prototype.parseObjectProperty = function(hasProto) {
        var node = this.createNode();
        var token = this.lookahead;
        var kind;
        var key = null;
        var value = null;
        var computed = false;
        var method = false;
        var shorthand = false;
        var isAsync = false;
        var isGenerator = false;
        if (token.type === 3) {
            var id = token.value;
            this.nextToken();
            computed = this.match('[');
            isAsync = !this.hasLineTerminator && id === 'async' && !this.match(':') && !this.match('(') && !this.match(',');
            isGenerator = this.match('*');
            if (isGenerator) {
                this.nextToken();
            }
            key = isAsync ? this.parseObjectPropertyKey() : this.finalize(node, new Identifier(id));
        } else if (this.match('*')) {
            this.nextToken();
        } else {
            computed = this.match('[');
            key = this.parseObjectPropertyKey();
        }
        var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
        if (token.type === 3 && !isAsync && token.value === 'get' && lookaheadPropertyKey) {
            kind = 'get';
            computed = this.match('[');
            key = this.parseObjectPropertyKey();
            this.context.allowYield = false;
            value = this.parseGetterMethod();
        } else if (token.type === 3 && !isAsync && token.value === 'set' && lookaheadPropertyKey) {
            kind = 'set';
            computed = this.match('[');
            key = this.parseObjectPropertyKey();
            value = this.parseSetterMethod();
        } else if (token.type === 7 && token.value === '*' && lookaheadPropertyKey) {
            kind = 'init';
            computed = this.match('[');
            key = this.parseObjectPropertyKey();
            value = this.parseGeneratorMethod();
            method = true;
        } else {
            if (!key) {
                this.throwUnexpectedToken(this.lookahead);
            }
            kind = 'init';
            if (this.match(':') && !isAsync) {
                if (!computed && this.isPropertyKey(key, '__proto__')) {
                    if (hasProto.value) {
                        this.tolerateError(Messages.DuplicateProtoProperty);
                    }
                    hasProto.value = true;
                }
                this.nextToken();
                value = this.inheritCoverGrammar(this.parseAssignmentExpression);
            } else if (this.match('(')) {
                value = isAsync ? this.parsePropertyMethodAsyncFunction(isGenerator) : this.parsePropertyMethodFunction(isGenerator);
                method = true;
            } else if (token.type === 3) {
                var id = this.finalize(node, new Identifier(token.value));
                if (this.match('=')) {
                    this.context.firstCoverInitializedNameError = this.lookahead;
                    this.nextToken();
                    shorthand = true;
                    var init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                    value = this.finalize(node, new AssignmentPattern(id, init));
                } else {
                    shorthand = true;
                    value = id;
                }
            } else {
                this.throwUnexpectedToken(this.nextToken());
            }
        }
        return this.finalize(node, new Property(kind, key, computed, value, method, shorthand));
    };
    Parser.prototype.parseObjectInitializer = function() {
        var node = this.createNode();
        this.expect('{');
        var properties = [];
        var hasProto = {
            value: false
        };
        while(!this.match('}')){
            properties.push(this.match('...') ? this.parseSpreadElement() : this.parseObjectProperty(hasProto));
            if (!this.match('}')) {
                this.expectCommaSeparator();
            }
        }
        this.expect('}');
        return this.finalize(node, new ObjectExpression(properties));
    };
    Parser.prototype.throwTemplateLiteralEarlyErrors = function(token) {
        switch(token.notEscapeSequenceHead){
            case 'u':
                return this.throwUnexpectedToken(token, Messages.InvalidUnicodeEscapeSequence);
            case 'x':
                return this.throwUnexpectedToken(token, Messages.InvalidHexEscapeSequence);
            case '8':
            case '9':
                return this.throwUnexpectedToken(token, Messages.TemplateEscape89);
            default:
                return this.throwUnexpectedToken(token, Messages.TemplateOctalLiteral);
        }
    };
    Parser.prototype.parseTemplateHead = function(options) {
        assert(this.lookahead.head, 'Template literal must start with a template head');
        var node = this.createNode();
        var token = this.nextToken();
        if (!options.isTagged && token.notEscapeSequenceHead !== null) {
            this.throwTemplateLiteralEarlyErrors(token);
        }
        var raw = token.value;
        var cooked = token.cooked;
        return this.finalize(node, new TemplateElement({
            raw: raw,
            cooked: cooked
        }, token.tail));
    };
    Parser.prototype.parseTemplateElement = function(options) {
        if (this.lookahead.type !== 10) {
            this.throwUnexpectedToken();
        }
        var node = this.createNode();
        var token = this.nextToken();
        if (!options.isTagged && token.notEscapeSequenceHead !== null) {
            this.throwTemplateLiteralEarlyErrors(token);
        }
        var raw = token.value;
        var cooked = token.cooked;
        return this.finalize(node, new TemplateElement({
            raw: raw,
            cooked: cooked
        }, token.tail));
    };
    Parser.prototype.parseTemplateLiteral = function(options) {
        var node = this.createNode();
        var expressions = [];
        var quasis = [];
        var quasi = this.parseTemplateHead(options);
        quasis.push(quasi);
        while(!quasi.tail){
            expressions.push(this.parseExpression());
            quasi = this.parseTemplateElement(options);
            quasis.push(quasi);
        }
        return this.finalize(node, new TemplateLiteral(quasis, expressions));
    };
    Parser.prototype.reinterpretExpressionAsPattern = function(expr) {
        switch(expr.type){
            case Syntax.Identifier:
            case Syntax.MemberExpression:
            case Syntax.RestElement:
            case Syntax.AssignmentPattern:
                break;
            case Syntax.SpreadElement:
                expr.type = Syntax.RestElement;
                this.reinterpretExpressionAsPattern(expr.argument);
                break;
            case Syntax.ArrayExpression:
                expr.type = Syntax.ArrayPattern;
                for(var i = 0; i < expr.elements.length; i++){
                    if (expr.elements[i] !== null) {
                        this.reinterpretExpressionAsPattern(expr.elements[i]);
                    }
                }
                break;
            case Syntax.ObjectExpression:
                expr.type = Syntax.ObjectPattern;
                for(var i = 0; i < expr.properties.length; i++){
                    var property = expr.properties[i];
                    this.reinterpretExpressionAsPattern(property.type === Syntax.SpreadElement ? property : property.value);
                }
                break;
            case Syntax.AssignmentExpression:
                expr.type = Syntax.AssignmentPattern;
                delete expr.operator;
                this.reinterpretExpressionAsPattern(expr.left);
                break;
            default:
                break;
        }
    };
    Parser.prototype.parseGroupExpression = function() {
        var expr;
        this.expect('(');
        if (this.match(')')) {
            this.nextToken();
            if (!this.match('=>')) {
                this.expect('=>');
            }
            expr = {
                type: ArrowParameterPlaceHolder,
                params: [],
                async: false
            };
        } else {
            var startToken = this.lookahead;
            var params = [];
            if (this.match('...')) {
                expr = this.parseRestElement(params);
                this.expect(')');
                if (!this.match('=>')) {
                    this.expect('=>');
                }
                expr = {
                    type: ArrowParameterPlaceHolder,
                    params: [
                        expr
                    ],
                    async: false
                };
            } else {
                var arrow = false;
                this.context.isBindingElement = true;
                expr = this.inheritCoverGrammar(this.parseAssignmentExpression);
                if (this.match(',')) {
                    var expressions = [];
                    this.context.isAssignmentTarget = false;
                    expressions.push(expr);
                    while(this.lookahead.type !== 2){
                        if (!this.match(',')) {
                            break;
                        }
                        this.nextToken();
                        if (this.match(')')) {
                            this.nextToken();
                            for(var i = 0; i < expressions.length; i++){
                                this.reinterpretExpressionAsPattern(expressions[i]);
                            }
                            arrow = true;
                            expr = {
                                type: ArrowParameterPlaceHolder,
                                params: expressions,
                                async: false
                            };
                        } else if (this.match('...')) {
                            if (!this.context.isBindingElement) {
                                this.throwUnexpectedToken(this.lookahead);
                            }
                            expressions.push(this.parseRestElement(params));
                            this.expect(')');
                            if (!this.match('=>')) {
                                this.expect('=>');
                            }
                            this.context.isBindingElement = false;
                            for(var i = 0; i < expressions.length; i++){
                                this.reinterpretExpressionAsPattern(expressions[i]);
                            }
                            arrow = true;
                            expr = {
                                type: ArrowParameterPlaceHolder,
                                params: expressions,
                                async: false
                            };
                        } else {
                            expressions.push(this.inheritCoverGrammar(this.parseAssignmentExpression));
                        }
                        if (arrow) {
                            break;
                        }
                    }
                    if (!arrow) {
                        expr = this.finalize(this.startNode(startToken), new SequenceExpression(expressions));
                    }
                }
                if (!arrow) {
                    this.expect(')');
                    if (this.match('=>')) {
                        if (expr.type === Syntax.Identifier && expr.name === 'yield') {
                            arrow = true;
                            expr = {
                                type: ArrowParameterPlaceHolder,
                                params: [
                                    expr
                                ],
                                async: false
                            };
                        }
                        if (!arrow) {
                            if (!this.context.isBindingElement) {
                                this.throwUnexpectedToken(this.lookahead);
                            }
                            if (expr.type === Syntax.SequenceExpression) {
                                for(var i = 0; i < expr.expressions.length; i++){
                                    this.reinterpretExpressionAsPattern(expr.expressions[i]);
                                }
                            } else {
                                this.reinterpretExpressionAsPattern(expr);
                            }
                            var parameters = expr.type === Syntax.SequenceExpression ? expr.expressions : [
                                expr
                            ];
                            expr = {
                                type: ArrowParameterPlaceHolder,
                                params: parameters,
                                async: false
                            };
                        }
                    }
                    this.context.isBindingElement = false;
                }
            }
        }
        return expr;
    };
    Parser.prototype.parseArguments = function() {
        this.expect('(');
        var args = [];
        if (!this.match(')')) {
            while(true){
                var expr = this.match('...') ? this.parseSpreadElement() : this.isolateCoverGrammar(this.parseAssignmentExpression);
                args.push(expr);
                if (this.match(')')) {
                    break;
                }
                this.expectCommaSeparator();
                if (this.match(')')) {
                    break;
                }
            }
        }
        this.expect(')');
        return args;
    };
    Parser.prototype.isIdentifierName = function(token) {
        return token.type === 3 || token.type === 4 || token.type === 1 || token.type === 5;
    };
    Parser.prototype.parseIdentifierName = function() {
        var node = this.createNode();
        var token = this.nextToken();
        if (!this.isIdentifierName(token)) {
            this.throwUnexpectedToken(token);
        }
        return this.finalize(node, new Identifier(token.value));
    };
    Parser.prototype.parseNewExpression = function() {
        var node = this.createNode();
        var id = this.parseIdentifierName();
        assert(id.name === 'new', 'New expression must start with `new`');
        var expr;
        if (this.match('.')) {
            this.nextToken();
            if (this.lookahead.type === 3 && this.context.inFunctionBody && this.lookahead.value === 'target') {
                var property = this.parseIdentifierName();
                expr = new MetaProperty(id, property);
            } else {
                this.throwUnexpectedToken(this.lookahead);
            }
        } else if (this.matchKeyword('import')) {
            this.throwUnexpectedToken(this.lookahead);
        } else {
            var callee = this.isolateCoverGrammar(this.parseLeftHandSideExpression);
            var args = this.match('(') ? this.parseArguments() : [];
            expr = new NewExpression(callee, args);
            this.context.isAssignmentTarget = false;
            this.context.isBindingElement = false;
        }
        return this.finalize(node, expr);
    };
    Parser.prototype.parseAsyncArgument = function() {
        var arg = this.parseAssignmentExpression();
        this.context.firstCoverInitializedNameError = null;
        return arg;
    };
    Parser.prototype.parseAsyncArguments = function() {
        this.expect('(');
        var args = [];
        if (!this.match(')')) {
            while(true){
                var expr = this.match('...') ? this.parseSpreadElement() : this.isolateCoverGrammar(this.parseAsyncArgument);
                args.push(expr);
                if (this.match(')')) {
                    break;
                }
                this.expectCommaSeparator();
                if (this.match(')')) {
                    break;
                }
            }
        }
        this.expect(')');
        return args;
    };
    Parser.prototype.matchImportCall = function() {
        var match = this.matchKeyword('import');
        if (match) {
            var state = this.scanner.saveState();
            this.scanner.scanComments();
            var next = this.scanner.lex();
            this.scanner.restoreState(state);
            match = next.type === 7 && next.value === '(';
        }
        return match;
    };
    Parser.prototype.parseImportCall = function() {
        var node = this.createNode();
        this.expectKeyword('import');
        return this.finalize(node, new Import());
    };
    Parser.prototype.matchImportMeta = function() {
        var match = this.matchKeyword('import');
        if (match) {
            var state = this.scanner.saveState();
            this.scanner.scanComments();
            var dot = this.scanner.lex();
            if (dot.type === 7 && dot.value === '.') {
                this.scanner.scanComments();
                var meta = this.scanner.lex();
                match = meta.type === 3 && meta.value === 'meta';
                if (match) {
                    if (meta.end - meta.start !== 'meta'.length) {
                        this.tolerateUnexpectedToken(meta, Messages.InvalidEscapedReservedWord);
                    }
                }
            } else {
                match = false;
            }
            this.scanner.restoreState(state);
        }
        return match;
    };
    Parser.prototype.parseImportMeta = function() {
        var node = this.createNode();
        var id = this.parseIdentifierName();
        this.expect('.');
        var property = this.parseIdentifierName();
        this.context.isAssignmentTarget = false;
        return this.finalize(node, new MetaProperty(id, property));
    };
    Parser.prototype.parseLeftHandSideExpressionAllowCall = function() {
        var startToken = this.lookahead;
        var maybeAsync = this.matchContextualKeyword('async');
        var previousAllowIn = this.context.allowIn;
        this.context.allowIn = true;
        var expr;
        var isSuper = this.matchKeyword('super');
        if (isSuper && this.context.inFunctionBody) {
            expr = this.createNode();
            this.nextToken();
            expr = this.finalize(expr, new Super());
            if (!this.match('(') && !this.match('.') && !this.match('[')) {
                this.throwUnexpectedToken(this.lookahead);
            }
        } else {
            expr = this.inheritCoverGrammar(this.matchKeyword('new') ? this.parseNewExpression : this.parsePrimaryExpression);
        }
        if (isSuper && this.match('(') && !this.context.inClassConstructor) {
            this.tolerateError(Messages.UnexpectedSuper);
        }
        var hasOptional = false;
        while(true){
            var optional = false;
            if (this.match('?.')) {
                optional = true;
                hasOptional = true;
                this.expect('?.');
            }
            if (this.match('(')) {
                var asyncArrow = maybeAsync && startToken.lineNumber === this.lookahead.lineNumber;
                this.context.isBindingElement = false;
                this.context.isAssignmentTarget = false;
                var args = asyncArrow ? this.parseAsyncArguments() : this.parseArguments();
                if (expr.type === Syntax.Import && args.length !== 1) {
                    this.tolerateError(Messages.BadImportCallArity);
                }
                expr = this.finalize(this.startNode(startToken), new CallExpression(expr, args, optional));
                if (asyncArrow && this.match('=>')) {
                    for(var i = 0; i < args.length; ++i){
                        this.reinterpretExpressionAsPattern(args[i]);
                    }
                    expr = {
                        type: ArrowParameterPlaceHolder,
                        params: args,
                        async: true
                    };
                }
            } else if (this.match('[')) {
                this.context.isBindingElement = false;
                this.context.isAssignmentTarget = !optional;
                this.expect('[');
                var property = this.isolateCoverGrammar(this.parseExpression);
                this.expect(']');
                expr = this.finalize(this.startNode(startToken), new ComputedMemberExpression(expr, property, optional));
            } else if (this.lookahead.type === 10 && this.lookahead.head) {
                if (optional) {
                    this.throwUnexpectedToken(this.lookahead);
                }
                if (hasOptional) {
                    this.throwError(Messages.InvalidTaggedTemplateOnOptionalChain);
                }
                var quasi = this.parseTemplateLiteral({
                    isTagged: true
                });
                expr = this.finalize(this.startNode(startToken), new TaggedTemplateExpression(expr, quasi));
            } else if (this.match('.') || optional) {
                this.context.isBindingElement = false;
                this.context.isAssignmentTarget = !optional;
                if (!optional) {
                    this.expect('.');
                }
                var property = this.parseIdentifierName();
                expr = this.finalize(this.startNode(startToken), new StaticMemberExpression(expr, property, optional));
            } else {
                break;
            }
        }
        this.context.allowIn = previousAllowIn;
        if (hasOptional) {
            return new ChainExpression(expr);
        }
        return expr;
    };
    Parser.prototype.parseSuper = function() {
        var node = this.createNode();
        this.expectKeyword('super');
        if (!this.match('[') && !this.match('.')) {
            this.throwUnexpectedToken(this.lookahead);
        }
        return this.finalize(node, new Super());
    };
    Parser.prototype.parseLeftHandSideExpression = function() {
        assert(this.context.allowIn, 'callee of new expression always allow in keyword.');
        var node = this.startNode(this.lookahead);
        var expr = this.matchKeyword('super') && this.context.inFunctionBody ? this.parseSuper() : this.inheritCoverGrammar(this.matchKeyword('new') ? this.parseNewExpression : this.parsePrimaryExpression);
        var hasOptional = false;
        while(true){
            var optional = false;
            if (this.match('?.')) {
                optional = true;
                hasOptional = true;
                this.expect('?.');
            }
            if (this.match('[')) {
                this.context.isBindingElement = false;
                this.context.isAssignmentTarget = !optional;
                this.expect('[');
                var property = this.isolateCoverGrammar(this.parseExpression);
                this.expect(']');
                expr = this.finalize(node, new ComputedMemberExpression(expr, property, optional));
            } else if (this.lookahead.type === 10 && this.lookahead.head) {
                if (optional) {
                    this.throwUnexpectedToken(this.lookahead);
                }
                if (hasOptional) {
                    this.throwError(Messages.InvalidTaggedTemplateOnOptionalChain);
                }
                var quasi = this.parseTemplateLiteral({
                    isTagged: true
                });
                expr = this.finalize(node, new TaggedTemplateExpression(expr, quasi));
            } else if (this.match('.') || optional) {
                this.context.isBindingElement = false;
                this.context.isAssignmentTarget = !optional;
                if (!optional) {
                    this.expect('.');
                }
                var property = this.parseIdentifierName();
                expr = this.finalize(node, new StaticMemberExpression(expr, property, optional));
            } else {
                break;
            }
        }
        if (hasOptional) {
            return new ChainExpression(expr);
        }
        return expr;
    };
    Parser.prototype.parseUpdateExpression = function() {
        var expr;
        var startToken = this.lookahead;
        if (this.match('++') || this.match('--')) {
            var node = this.startNode(startToken);
            var token = this.nextToken();
            expr = this.inheritCoverGrammar(this.parseUnaryExpression);
            if (this.context.strict && expr.type === Syntax.Identifier && this.scanner.isRestrictedWord(expr.name)) {
                this.tolerateError(Messages.StrictLHSPrefix);
            }
            if (!this.context.isAssignmentTarget) {
                this.tolerateError(Messages.InvalidLHSInAssignment);
            }
            var prefix = true;
            expr = this.finalize(node, new UpdateExpression(token.value, expr, prefix));
            this.context.isAssignmentTarget = false;
            this.context.isBindingElement = false;
        } else {
            expr = this.inheritCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
            if (!this.hasLineTerminator && this.lookahead.type === 7) {
                if (this.match('++') || this.match('--')) {
                    if (this.context.strict && expr.type === Syntax.Identifier && this.scanner.isRestrictedWord(expr.name)) {
                        this.tolerateError(Messages.StrictLHSPostfix);
                    }
                    if (!this.context.isAssignmentTarget) {
                        this.tolerateError(Messages.InvalidLHSInAssignment);
                    }
                    this.context.isAssignmentTarget = false;
                    this.context.isBindingElement = false;
                    var operator = this.nextToken().value;
                    var prefix = false;
                    expr = this.finalize(this.startNode(startToken), new UpdateExpression(operator, expr, prefix));
                }
            }
        }
        return expr;
    };
    Parser.prototype.parseAwaitExpression = function() {
        var node = this.createNode();
        this.nextToken();
        var argument = this.parseUnaryExpression();
        return this.finalize(node, new AwaitExpression(argument));
    };
    Parser.prototype.parseUnaryExpression = function() {
        var expr;
        if (this.match('+') || this.match('-') || this.match('~') || this.match('!') || this.matchKeyword('delete') || this.matchKeyword('void') || this.matchKeyword('typeof')) {
            var node = this.startNode(this.lookahead);
            var token = this.nextToken();
            expr = this.inheritCoverGrammar(this.parseUnaryExpression);
            expr = this.finalize(node, new UnaryExpression(token.value, expr));
            if (this.context.strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                this.tolerateError(Messages.StrictDelete);
            }
            this.context.isAssignmentTarget = false;
            this.context.isBindingElement = false;
        } else if (this.context.isAsync && this.matchContextualKeyword('await')) {
            expr = this.parseAwaitExpression();
        } else {
            expr = this.parseUpdateExpression();
        }
        return expr;
    };
    Parser.prototype.parseExponentiationExpression = function() {
        var startToken = this.lookahead;
        var expr = this.inheritCoverGrammar(this.parseUnaryExpression);
        if (expr.type !== Syntax.UnaryExpression && this.match('**')) {
            this.nextToken();
            this.context.isAssignmentTarget = false;
            this.context.isBindingElement = false;
            var left = expr;
            var right = this.isolateCoverGrammar(this.parseExponentiationExpression);
            expr = this.finalize(this.startNode(startToken), new BinaryExpression('**', left, right));
        }
        return expr;
    };
    Parser.prototype.binaryPrecedence = function(token) {
        var op = token.value;
        var precedence;
        if (token.type === 7) {
            precedence = this.operatorPrecedence[op] || 0;
        } else if (token.type === 4) {
            precedence = op === 'instanceof' || this.context.allowIn && op === 'in' ? 12 : 0;
        } else {
            precedence = 0;
        }
        return precedence;
    };
    Parser.prototype.parseBinaryExpression = function() {
        var startToken = this.lookahead;
        var expr = this.inheritCoverGrammar(this.parseExponentiationExpression);
        var allowAndOr = true;
        var allowNullishCoalescing = true;
        var updateNullishCoalescingRestrictions = function(token) {
            if (token.value === '&&' || token.value === '||') {
                allowNullishCoalescing = false;
            }
            if (token.value === '??') {
                allowAndOr = false;
            }
        };
        var token = this.lookahead;
        var prec = this.binaryPrecedence(token);
        if (prec > 0) {
            updateNullishCoalescingRestrictions(token);
            this.nextToken();
            this.context.isAssignmentTarget = false;
            this.context.isBindingElement = false;
            var markers = [
                startToken,
                this.lookahead
            ];
            var left = expr;
            var right = this.isolateCoverGrammar(this.parseExponentiationExpression);
            var stack = [
                left,
                token.value,
                right
            ];
            var precedences = [
                prec
            ];
            while(true){
                prec = this.binaryPrecedence(this.lookahead);
                if (prec <= 0) {
                    break;
                }
                if (!allowAndOr && (this.lookahead.value === '&&' || this.lookahead.value === '||') || !allowNullishCoalescing && this.lookahead.value === '??') {
                    this.throwUnexpectedToken(this.lookahead);
                }
                updateNullishCoalescingRestrictions(this.lookahead);
                while(stack.length > 2 && prec <= precedences[precedences.length - 1]){
                    right = stack.pop();
                    var operator = stack.pop();
                    precedences.pop();
                    left = stack.pop();
                    markers.pop();
                    var marker = markers[markers.length - 1];
                    var node = this.startNode(marker, marker.lineStart);
                    stack.push(this.finalize(node, new BinaryExpression(operator, left, right)));
                }
                stack.push(this.nextToken().value);
                precedences.push(prec);
                markers.push(this.lookahead);
                stack.push(this.isolateCoverGrammar(this.parseExponentiationExpression));
            }
            var i = stack.length - 1;
            expr = stack[i];
            var lastMarker = markers.pop();
            while(i > 1){
                var marker = markers.pop();
                var lastLineStart = lastMarker && lastMarker.lineStart;
                var node = this.startNode(marker, lastLineStart);
                var operator = stack[i - 1];
                expr = this.finalize(node, new BinaryExpression(operator, stack[i - 2], expr));
                i -= 2;
                lastMarker = marker;
            }
        }
        return expr;
    };
    Parser.prototype.parseConditionalExpression = function() {
        var startToken = this.lookahead;
        var expr = this.inheritCoverGrammar(this.parseBinaryExpression);
        if (this.match('?')) {
            this.nextToken();
            var previousAllowIn = this.context.allowIn;
            this.context.allowIn = true;
            var consequent = this.isolateCoverGrammar(this.parseAssignmentExpression);
            this.context.allowIn = previousAllowIn;
            this.expect(':');
            var alternate = this.isolateCoverGrammar(this.parseAssignmentExpression);
            expr = this.finalize(this.startNode(startToken), new ConditionalExpression(expr, consequent, alternate));
            this.context.isAssignmentTarget = false;
            this.context.isBindingElement = false;
        }
        return expr;
    };
    Parser.prototype.checkPatternParam = function(options, param) {
        switch(param.type){
            case Syntax.Identifier:
                this.validateParam(options, param, param.name);
                break;
            case Syntax.RestElement:
                this.checkPatternParam(options, param.argument);
                break;
            case Syntax.AssignmentPattern:
                this.checkPatternParam(options, param.left);
                break;
            case Syntax.ArrayPattern:
                for(var i = 0; i < param.elements.length; i++){
                    if (param.elements[i] !== null) {
                        this.checkPatternParam(options, param.elements[i]);
                    }
                }
                break;
            case Syntax.ObjectPattern:
                for(var i = 0; i < param.properties.length; i++){
                    var property = param.properties[i];
                    this.checkPatternParam(options, property.type === Syntax.RestElement ? property : property.value);
                }
                break;
            default:
                break;
        }
        options.simple = options.simple && param instanceof Identifier;
    };
    Parser.prototype.reinterpretAsCoverFormalsList = function(expr) {
        var params = [
            expr
        ];
        var options = {
            simple: true,
            paramSet: {}
        };
        var asyncArrow = false;
        switch(expr.type){
            case Syntax.Identifier:
                break;
            case ArrowParameterPlaceHolder:
                params = expr.params;
                asyncArrow = expr.async;
                break;
            default:
                return null;
        }
        for(var i = 0; i < params.length; ++i){
            var param = params[i];
            if (param.type === Syntax.AssignmentPattern) {
                if (param.right.type === Syntax.YieldExpression) {
                    if (param.right.argument) {
                        this.throwUnexpectedToken(this.lookahead);
                    }
                    param.right.type = Syntax.Identifier;
                    param.right.name = 'yield';
                    delete param.right.argument;
                    delete param.right.delegate;
                }
            } else if (asyncArrow && param.type === Syntax.Identifier && param.name === 'await') {
                this.throwUnexpectedToken(this.lookahead);
            }
            this.checkPatternParam(options, param);
            params[i] = param;
        }
        if (this.context.strict || !this.context.allowYield) {
            for(var i = 0; i < params.length; ++i){
                var param = params[i];
                if (param.type === Syntax.YieldExpression) {
                    this.throwUnexpectedToken(this.lookahead);
                }
            }
        }
        if (options.hasDuplicateParameterNames) {
            var token = this.context.strict ? options.stricted : options.firstRestricted;
            this.throwUnexpectedToken(token, Messages.DuplicateParameter);
        }
        return {
            simple: options.simple,
            params: params,
            stricted: options.stricted,
            firstRestricted: options.firstRestricted,
            message: options.message
        };
    };
    Parser.prototype.parseAssignmentExpression = function() {
        var expr;
        if (!this.context.allowYield && this.matchKeyword('yield')) {
            expr = this.parseYieldExpression();
        } else {
            var startToken = this.lookahead;
            var token = startToken;
            expr = this.parseConditionalExpression();
            if (token.type === 3 && token.lineNumber === this.lookahead.lineNumber && token.value === 'async') {
                if (this.lookahead.type === 3 || this.matchKeyword('yield')) {
                    var arg = this.parsePrimaryExpression();
                    this.reinterpretExpressionAsPattern(arg);
                    expr = {
                        type: ArrowParameterPlaceHolder,
                        params: [
                            arg
                        ],
                        async: true
                    };
                }
            }
            if (expr.type === ArrowParameterPlaceHolder || this.match('=>')) {
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
                var isAsync = expr.async;
                var list = this.reinterpretAsCoverFormalsList(expr);
                if (list) {
                    if (this.hasLineTerminator) {
                        this.tolerateUnexpectedToken(this.lookahead);
                    }
                    this.context.firstCoverInitializedNameError = null;
                    var previousStrict = this.context.strict;
                    var previousAllowStrictDirective = this.context.allowStrictDirective;
                    this.context.allowStrictDirective = list.simple;
                    var previousAllowYield = this.context.allowYield;
                    var previousIsAsync = this.context.isAsync;
                    this.context.allowYield = true;
                    this.context.isAsync = isAsync;
                    var node = this.startNode(startToken);
                    this.expect('=>');
                    var body = void 0;
                    if (this.match('{')) {
                        var previousAllowIn = this.context.allowIn;
                        this.context.allowIn = true;
                        body = this.parseFunctionSourceElements();
                        this.context.allowIn = previousAllowIn;
                    } else {
                        body = this.isolateCoverGrammar(this.parseAssignmentExpression);
                    }
                    var expression = body.type !== Syntax.BlockStatement;
                    if (this.context.strict && list.firstRestricted) {
                        this.throwUnexpectedToken(list.firstRestricted, list.message);
                    }
                    if (this.context.strict && list.stricted) {
                        this.tolerateUnexpectedToken(list.stricted, list.message);
                    }
                    expr = isAsync ? this.finalize(node, new AsyncArrowFunctionExpression(list.params, body, expression)) : this.finalize(node, new ArrowFunctionExpression(list.params, body, expression));
                    this.context.strict = previousStrict;
                    this.context.allowStrictDirective = previousAllowStrictDirective;
                    this.context.allowYield = previousAllowYield;
                    this.context.isAsync = previousIsAsync;
                }
            } else {
                if (this.matchAssign()) {
                    if (!this.context.isAssignmentTarget) {
                        this.tolerateError(Messages.InvalidLHSInAssignment);
                    }
                    if (this.context.strict && expr.type === Syntax.Identifier) {
                        var id = expr;
                        if (this.scanner.isRestrictedWord(id.name)) {
                            this.tolerateUnexpectedToken(token, Messages.StrictLHSAssignment);
                        }
                        if (this.scanner.isStrictModeReservedWord(id.name)) {
                            this.tolerateUnexpectedToken(token, Messages.StrictReservedWord);
                        }
                    }
                    if (!this.match('=')) {
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                    } else {
                        this.reinterpretExpressionAsPattern(expr);
                    }
                    token = this.nextToken();
                    var operator = token.value;
                    var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
                    expr = this.finalize(this.startNode(startToken), new AssignmentExpression(operator, expr, right));
                    this.context.firstCoverInitializedNameError = null;
                }
            }
        }
        return expr;
    };
    Parser.prototype.parseExpression = function() {
        var startToken = this.lookahead;
        var expr = this.isolateCoverGrammar(this.parseAssignmentExpression);
        if (this.match(',')) {
            var expressions = [];
            expressions.push(expr);
            while(this.lookahead.type !== 2){
                if (!this.match(',')) {
                    break;
                }
                this.nextToken();
                expressions.push(this.isolateCoverGrammar(this.parseAssignmentExpression));
            }
            expr = this.finalize(this.startNode(startToken), new SequenceExpression(expressions));
        }
        return expr;
    };
    Parser.prototype.parseStatementListItem = function() {
        var statement;
        this.context.isAssignmentTarget = true;
        this.context.isBindingElement = true;
        if (this.lookahead.type === 4) {
            switch(this.lookahead.value){
                case 'export':
                    if (!this.context.isModule) {
                        this.tolerateUnexpectedToken(this.lookahead, Messages.IllegalExportDeclaration);
                    }
                    statement = this.parseExportDeclaration();
                    break;
                case 'import':
                    if (this.matchImportCall()) {
                        statement = this.parseExpressionStatement();
                    } else if (this.matchImportMeta()) {
                        statement = this.parseStatement();
                    } else {
                        if (!this.context.isModule) {
                            this.tolerateUnexpectedToken(this.lookahead, Messages.IllegalImportDeclaration);
                        }
                        statement = this.parseImportDeclaration();
                    }
                    break;
                case 'const':
                    statement = this.parseLexicalDeclaration({
                        inFor: false
                    });
                    break;
                case 'function':
                    statement = this.parseFunctionDeclaration();
                    break;
                case 'class':
                    statement = this.parseClassDeclaration();
                    break;
                case 'let':
                    statement = this.isLexicalDeclaration() ? this.parseLexicalDeclaration({
                        inFor: false
                    }) : this.parseStatement();
                    break;
                default:
                    statement = this.parseStatement();
                    break;
            }
        } else {
            statement = this.parseStatement();
        }
        return statement;
    };
    Parser.prototype.parseBlock = function() {
        var node = this.createNode();
        this.expect('{');
        var block = [];
        while(true){
            if (this.match('}')) {
                break;
            }
            block.push(this.parseStatementListItem());
        }
        this.expect('}');
        return this.finalize(node, new BlockStatement(block));
    };
    Parser.prototype.parseLexicalBinding = function(kind, options) {
        var node = this.createNode();
        var params = [];
        var id = this.parsePattern(params, kind);
        if (this.context.strict && id.type === Syntax.Identifier) {
            if (this.scanner.isRestrictedWord(id.name)) {
                this.tolerateError(Messages.StrictVarName);
            }
        }
        var init = null;
        if (kind === 'const') {
            if (!this.matchKeyword('in') && !this.matchContextualKeyword('of')) {
                if (this.match('=')) {
                    this.nextToken();
                    init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                } else {
                    this.throwError(Messages.DeclarationMissingInitializer, 'const');
                }
            }
        } else if (!options.inFor && id.type !== Syntax.Identifier || this.match('=')) {
            this.expect('=');
            init = this.isolateCoverGrammar(this.parseAssignmentExpression);
        }
        return this.finalize(node, new VariableDeclarator(id, init));
    };
    Parser.prototype.parseBindingList = function(kind, options) {
        var list = [
            this.parseLexicalBinding(kind, options)
        ];
        while(this.match(',')){
            this.nextToken();
            list.push(this.parseLexicalBinding(kind, options));
        }
        return list;
    };
    Parser.prototype.isLexicalDeclaration = function() {
        var state = this.scanner.saveState();
        this.scanner.scanComments();
        var next = this.scanner.lex();
        this.scanner.restoreState(state);
        return next.type === 3 || next.type === 7 && next.value === '[' || next.type === 7 && next.value === '{' || next.type === 4 && next.value === 'let' || next.type === 4 && next.value === 'yield';
    };
    Parser.prototype.parseLexicalDeclaration = function(options) {
        var node = this.createNode();
        var kind = this.nextToken().value;
        assert(kind === 'let' || kind === 'const', 'Lexical declaration must be either let or const');
        var declarations = this.parseBindingList(kind, options);
        this.consumeSemicolon();
        return this.finalize(node, new VariableDeclaration(declarations, kind));
    };
    Parser.prototype.parseBindingRestElement = function(params, kind) {
        var node = this.createNode();
        this.expect('...');
        var arg = this.parsePattern(params, kind);
        return this.finalize(node, new RestElement(arg));
    };
    Parser.prototype.parseArrayPattern = function(params, kind) {
        var node = this.createNode();
        this.expect('[');
        var elements = [];
        while(!this.match(']')){
            if (this.match(',')) {
                this.nextToken();
                elements.push(null);
            } else {
                if (this.match('...')) {
                    elements.push(this.parseBindingRestElement(params, kind));
                    break;
                } else {
                    elements.push(this.parsePatternWithDefault(params, kind));
                }
                if (!this.match(']')) {
                    this.expect(',');
                }
            }
        }
        this.expect(']');
        return this.finalize(node, new ArrayPattern(elements));
    };
    Parser.prototype.parsePropertyPattern = function(params, kind) {
        var node = this.createNode();
        var computed = false;
        var shorthand = false;
        var method = false;
        var key;
        var value;
        if (this.lookahead.type === 3) {
            var keyToken = this.lookahead;
            key = this.parseVariableIdentifier();
            var init = this.finalize(node, new Identifier(keyToken.value));
            if (this.match('=')) {
                params.push(keyToken);
                shorthand = true;
                this.nextToken();
                var expr = this.parseAssignmentExpression();
                value = this.finalize(this.startNode(keyToken), new AssignmentPattern(init, expr));
            } else if (!this.match(':')) {
                params.push(keyToken);
                shorthand = true;
                value = init;
            } else {
                this.expect(':');
                value = this.parsePatternWithDefault(params, kind);
            }
        } else {
            computed = this.match('[');
            key = this.parseObjectPropertyKey();
            this.expect(':');
            value = this.parsePatternWithDefault(params, kind);
        }
        return this.finalize(node, new Property('init', key, computed, value, method, shorthand));
    };
    Parser.prototype.parseRestProperty = function(params) {
        var node = this.createNode();
        this.expect('...');
        var arg = this.parsePattern(params);
        if (this.match('=')) {
            this.throwError(Messages.DefaultRestProperty);
        }
        if (!this.match('}')) {
            this.throwError(Messages.PropertyAfterRestProperty);
        }
        return this.finalize(node, new RestElement(arg));
    };
    Parser.prototype.parseObjectPattern = function(params, kind) {
        var node = this.createNode();
        var properties = [];
        this.expect('{');
        while(!this.match('}')){
            properties.push(this.match('...') ? this.parseRestProperty(params) : this.parsePropertyPattern(params, kind));
            if (!this.match('}')) {
                this.expect(',');
            }
        }
        this.expect('}');
        return this.finalize(node, new ObjectPattern(properties));
    };
    Parser.prototype.parsePattern = function(params, kind) {
        var pattern;
        if (this.match('[')) {
            pattern = this.parseArrayPattern(params, kind);
        } else if (this.match('{')) {
            pattern = this.parseObjectPattern(params, kind);
        } else {
            if (this.matchKeyword('let') && (kind === 'const' || kind === 'let')) {
                this.tolerateUnexpectedToken(this.lookahead, Messages.LetInLexicalBinding);
            }
            params.push(this.lookahead);
            pattern = this.parseVariableIdentifier(kind);
        }
        return pattern;
    };
    Parser.prototype.parsePatternWithDefault = function(params, kind) {
        var startToken = this.lookahead;
        var pattern = this.parsePattern(params, kind);
        if (this.match('=')) {
            this.nextToken();
            var previousAllowYield = this.context.allowYield;
            this.context.allowYield = true;
            var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
            this.context.allowYield = previousAllowYield;
            pattern = this.finalize(this.startNode(startToken), new AssignmentPattern(pattern, right));
        }
        return pattern;
    };
    Parser.prototype.parseVariableIdentifier = function(kind) {
        var node = this.createNode();
        var token = this.nextToken();
        if (token.type === 4 && token.value === 'yield') {
            if (this.context.strict) {
                this.tolerateUnexpectedToken(token, Messages.StrictReservedWord);
            } else if (!this.context.allowYield) {
                this.throwUnexpectedToken(token);
            }
        } else if (token.type !== 3) {
            if (this.context.strict && token.type === 4 && this.scanner.isStrictModeReservedWord(token.value)) {
                this.tolerateUnexpectedToken(token, Messages.StrictReservedWord);
            } else {
                if (this.context.strict || token.value !== 'let' || kind !== 'var') {
                    this.throwUnexpectedToken(token);
                }
            }
        } else if ((this.context.isModule || this.context.isAsync) && token.type === 3 && token.value === 'await') {
            this.tolerateUnexpectedToken(token);
        }
        return this.finalize(node, new Identifier(token.value));
    };
    Parser.prototype.parseVariableDeclaration = function(options) {
        var node = this.createNode();
        var params = [];
        var id = this.parsePattern(params, 'var');
        if (this.context.strict && id.type === Syntax.Identifier) {
            if (this.scanner.isRestrictedWord(id.name)) {
                this.tolerateError(Messages.StrictVarName);
            }
        }
        var init = null;
        if (this.match('=')) {
            this.nextToken();
            init = this.isolateCoverGrammar(this.parseAssignmentExpression);
        } else if (id.type !== Syntax.Identifier && !options.inFor) {
            this.expect('=');
        }
        return this.finalize(node, new VariableDeclarator(id, init));
    };
    Parser.prototype.parseVariableDeclarationList = function(options) {
        var opt = {
            inFor: options.inFor
        };
        var list = [];
        list.push(this.parseVariableDeclaration(opt));
        while(this.match(',')){
            this.nextToken();
            list.push(this.parseVariableDeclaration(opt));
        }
        return list;
    };
    Parser.prototype.parseVariableStatement = function() {
        var node = this.createNode();
        this.expectKeyword('var');
        var declarations = this.parseVariableDeclarationList({
            inFor: false
        });
        this.consumeSemicolon();
        return this.finalize(node, new VariableDeclaration(declarations, 'var'));
    };
    Parser.prototype.parseEmptyStatement = function() {
        var node = this.createNode();
        this.expect(';');
        return this.finalize(node, new EmptyStatement());
    };
    Parser.prototype.parseExpressionStatement = function() {
        var node = this.createNode();
        var expr = this.parseExpression();
        this.consumeSemicolon();
        return this.finalize(node, new ExpressionStatement(expr));
    };
    Parser.prototype.parseIfClause = function() {
        if (this.context.strict && this.matchKeyword('function')) {
            this.tolerateError(Messages.StrictFunction);
        }
        return this.parseStatement();
    };
    Parser.prototype.parseIfStatement = function() {
        var node = this.createNode();
        var consequent;
        var alternate = null;
        this.expectKeyword('if');
        this.expect('(');
        var test = this.parseExpression();
        if (!this.match(')') && this.config.tolerant) {
            this.tolerateUnexpectedToken(this.nextToken());
            consequent = this.finalize(this.createNode(), new EmptyStatement());
        } else {
            this.expect(')');
            consequent = this.parseIfClause();
            if (this.matchKeyword('else')) {
                this.nextToken();
                alternate = this.parseIfClause();
            }
        }
        return this.finalize(node, new IfStatement(test, consequent, alternate));
    };
    Parser.prototype.parseDoWhileStatement = function() {
        var node = this.createNode();
        this.expectKeyword('do');
        this.tolerateInvalidLoopStatement();
        var previousInIteration = this.context.inIteration;
        this.context.inIteration = true;
        var body = this.parseStatement();
        this.context.inIteration = previousInIteration;
        this.expectKeyword('while');
        this.expect('(');
        var test = this.parseExpression();
        if (!this.match(')') && this.config.tolerant) {
            this.tolerateUnexpectedToken(this.nextToken());
        } else {
            this.expect(')');
            if (this.match(';')) {
                this.nextToken();
            }
        }
        return this.finalize(node, new DoWhileStatement(body, test));
    };
    Parser.prototype.parseWhileStatement = function() {
        var node = this.createNode();
        var body;
        this.expectKeyword('while');
        this.expect('(');
        var test = this.parseExpression();
        if (!this.match(')') && this.config.tolerant) {
            this.tolerateUnexpectedToken(this.nextToken());
            body = this.finalize(this.createNode(), new EmptyStatement());
        } else {
            this.expect(')');
            var previousInIteration = this.context.inIteration;
            this.context.inIteration = true;
            body = this.parseStatement();
            this.context.inIteration = previousInIteration;
        }
        return this.finalize(node, new WhileStatement(test, body));
    };
    Parser.prototype.parseForStatement = function() {
        var init = null;
        var test = null;
        var update = null;
        var forIn = true;
        var left, right;
        var _await = false;
        var node = this.createNode();
        this.expectKeyword('for');
        if (this.matchContextualKeyword('await')) {
            if (!this.context.isAsync) {
                this.tolerateUnexpectedToken(this.lookahead);
            }
            _await = true;
            this.nextToken();
        }
        this.expect('(');
        if (this.match(';')) {
            this.nextToken();
        } else {
            if (this.matchKeyword('var')) {
                init = this.createNode();
                this.nextToken();
                var previousAllowIn = this.context.allowIn;
                this.context.allowIn = false;
                var declarations = this.parseVariableDeclarationList({
                    inFor: true
                });
                this.context.allowIn = previousAllowIn;
                if (!_await && declarations.length === 1 && this.matchKeyword('in')) {
                    var decl = declarations[0];
                    if (decl.init && (decl.id.type === Syntax.ArrayPattern || decl.id.type === Syntax.ObjectPattern || this.context.strict)) {
                        this.tolerateError(Messages.ForInOfLoopInitializer, 'for-in');
                    }
                    init = this.finalize(init, new VariableDeclaration(declarations, 'var'));
                    this.nextToken();
                    left = init;
                    right = this.parseExpression();
                    init = null;
                } else if (declarations.length === 1 && declarations[0].init === null && this.matchContextualKeyword('of')) {
                    init = this.finalize(init, new VariableDeclaration(declarations, 'var'));
                    this.nextToken();
                    left = init;
                    right = this.parseAssignmentExpression();
                    init = null;
                    forIn = false;
                } else {
                    init = this.finalize(init, new VariableDeclaration(declarations, 'var'));
                    this.expect(';');
                }
            } else if (this.matchKeyword('const') || this.matchKeyword('let')) {
                init = this.createNode();
                var kind = this.nextToken().value;
                if (!this.context.strict && this.lookahead.value === 'in') {
                    init = this.finalize(init, new Identifier(kind));
                    this.nextToken();
                    left = init;
                    right = this.parseExpression();
                    init = null;
                } else {
                    var previousAllowIn = this.context.allowIn;
                    this.context.allowIn = false;
                    var declarations = this.parseBindingList(kind, {
                        inFor: true
                    });
                    this.context.allowIn = previousAllowIn;
                    if (declarations.length === 1 && declarations[0].init === null && this.matchKeyword('in')) {
                        init = this.finalize(init, new VariableDeclaration(declarations, kind));
                        this.nextToken();
                        left = init;
                        right = this.parseExpression();
                        init = null;
                    } else if (declarations.length === 1 && declarations[0].init === null && this.matchContextualKeyword('of')) {
                        init = this.finalize(init, new VariableDeclaration(declarations, kind));
                        this.nextToken();
                        left = init;
                        right = this.parseAssignmentExpression();
                        init = null;
                        forIn = false;
                    } else {
                        this.consumeSemicolon();
                        init = this.finalize(init, new VariableDeclaration(declarations, kind));
                    }
                }
            } else {
                var initStartToken = this.lookahead;
                var previousIsBindingElement = this.context.isBindingElement;
                var previousIsAssignmentTarget = this.context.isAssignmentTarget;
                var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
                var previousAllowIn = this.context.allowIn;
                this.context.allowIn = false;
                init = this.inheritCoverGrammar(this.parseAssignmentExpression);
                this.context.allowIn = previousAllowIn;
                if (this.matchKeyword('in')) {
                    if (!this.context.isAssignmentTarget || init.type === Syntax.AssignmentExpression) {
                        this.tolerateError(Messages.InvalidLHSInForIn);
                    }
                    this.nextToken();
                    this.reinterpretExpressionAsPattern(init);
                    left = init;
                    right = this.parseExpression();
                    init = null;
                } else if (this.matchContextualKeyword('of')) {
                    if (!this.context.isAssignmentTarget || init.type === Syntax.AssignmentExpression) {
                        this.tolerateError(Messages.InvalidLHSInForLoop);
                    }
                    this.nextToken();
                    this.reinterpretExpressionAsPattern(init);
                    left = init;
                    right = this.parseAssignmentExpression();
                    init = null;
                    forIn = false;
                } else {
                    this.context.isBindingElement = previousIsBindingElement;
                    this.context.isAssignmentTarget = previousIsAssignmentTarget;
                    this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError;
                    if (this.match(',')) {
                        var initSeq = [
                            init
                        ];
                        while(this.match(',')){
                            this.nextToken();
                            initSeq.push(this.isolateCoverGrammar(this.parseAssignmentExpression));
                        }
                        init = this.finalize(this.startNode(initStartToken), new SequenceExpression(initSeq));
                    }
                    this.expect(';');
                }
            }
        }
        if (typeof left === 'undefined') {
            if (!this.match(';')) {
                test = this.isolateCoverGrammar(this.parseExpression);
            }
            this.expect(';');
            if (!this.match(')')) {
                update = this.isolateCoverGrammar(this.parseExpression);
            }
        }
        var body;
        if (!this.match(')') && this.config.tolerant) {
            this.tolerateUnexpectedToken(this.nextToken());
            body = this.finalize(this.createNode(), new EmptyStatement());
        } else {
            this.expect(')');
            this.tolerateInvalidLoopStatement();
            var previousInIteration = this.context.inIteration;
            this.context.inIteration = true;
            body = this.isolateCoverGrammar(this.parseStatement);
            this.context.inIteration = previousInIteration;
        }
        return typeof left === 'undefined' ? this.finalize(node, new ForStatement(init, test, update, body)) : forIn ? this.finalize(node, new ForInStatement(left, right, body)) : this.finalize(node, new ForOfStatement(left, right, body, _await));
    };
    Parser.prototype.parseContinueStatement = function() {
        var node = this.createNode();
        this.expectKeyword('continue');
        var label = null;
        if (this.lookahead.type === 3 && !this.hasLineTerminator) {
            var id = this.parseVariableIdentifier();
            label = id;
            var key = '$' + id.name;
            if (!Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
                this.throwError(Messages.UnknownLabel, id.name);
            }
        }
        this.consumeSemicolon();
        if (label === null && !this.context.inIteration) {
            this.throwError(Messages.IllegalContinue);
        }
        return this.finalize(node, new ContinueStatement(label));
    };
    Parser.prototype.parseBreakStatement = function() {
        var node = this.createNode();
        this.expectKeyword('break');
        var label = null;
        if (this.lookahead.type === 3 && !this.hasLineTerminator) {
            var id = this.parseVariableIdentifier();
            var key = '$' + id.name;
            if (!Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
                this.throwError(Messages.UnknownLabel, id.name);
            }
            label = id;
        }
        this.consumeSemicolon();
        if (label === null && !this.context.inIteration && !this.context.inSwitch) {
            this.throwError(Messages.IllegalBreak);
        }
        return this.finalize(node, new BreakStatement(label));
    };
    Parser.prototype.parseReturnStatement = function() {
        if (!this.context.inFunctionBody) {
            this.tolerateError(Messages.IllegalReturn);
        }
        var node = this.createNode();
        this.expectKeyword('return');
        var hasArgument = !this.match(';') && !this.match('}') && !this.hasLineTerminator && this.lookahead.type !== 2 || this.lookahead.type === 8 || this.lookahead.type === 10;
        var argument = hasArgument ? this.parseExpression() : null;
        this.consumeSemicolon();
        return this.finalize(node, new ReturnStatement(argument));
    };
    Parser.prototype.parseWithStatement = function() {
        if (this.context.strict) {
            this.tolerateError(Messages.StrictModeWith);
        }
        var node = this.createNode();
        var body;
        this.expectKeyword('with');
        this.expect('(');
        var object = this.parseExpression();
        if (!this.match(')') && this.config.tolerant) {
            this.tolerateUnexpectedToken(this.nextToken());
            body = this.finalize(this.createNode(), new EmptyStatement());
        } else {
            this.expect(')');
            body = this.parseStatement();
        }
        return this.finalize(node, new WithStatement(object, body));
    };
    Parser.prototype.parseSwitchCase = function() {
        var node = this.createNode();
        var test;
        if (this.matchKeyword('default')) {
            this.nextToken();
            test = null;
        } else {
            this.expectKeyword('case');
            test = this.parseExpression();
        }
        this.expect(':');
        var consequent = [];
        while(true){
            if (this.match('}') || this.matchKeyword('default') || this.matchKeyword('case')) {
                break;
            }
            consequent.push(this.parseStatementListItem());
        }
        return this.finalize(node, new SwitchCase(test, consequent));
    };
    Parser.prototype.parseSwitchStatement = function() {
        var node = this.createNode();
        this.expectKeyword('switch');
        this.expect('(');
        var discriminant = this.parseExpression();
        this.expect(')');
        var previousInSwitch = this.context.inSwitch;
        this.context.inSwitch = true;
        var cases = [];
        var defaultFound = false;
        this.expect('{');
        while(true){
            if (this.match('}')) {
                break;
            }
            var clause = this.parseSwitchCase();
            if (clause.test === null) {
                if (defaultFound) {
                    this.throwError(Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
            }
            cases.push(clause);
        }
        this.expect('}');
        this.context.inSwitch = previousInSwitch;
        return this.finalize(node, new SwitchStatement(discriminant, cases));
    };
    Parser.prototype.parseLabelledStatement = function() {
        var node = this.createNode();
        var expr = this.parseExpression();
        var statement;
        if (expr.type === Syntax.Identifier && this.match(':')) {
            this.nextToken();
            var id = expr;
            var key = '$' + id.name;
            if (Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
                this.throwError(Messages.Redeclaration, 'Label', id.name);
            }
            this.context.labelSet[key] = true;
            var body = void 0;
            if (this.matchKeyword('class')) {
                this.tolerateUnexpectedToken(this.lookahead);
                body = this.parseClassDeclaration();
            } else if (this.matchKeyword('function')) {
                var token = this.lookahead;
                var declaration = this.parseFunctionDeclaration();
                if (this.context.strict) {
                    this.tolerateUnexpectedToken(token, Messages.StrictFunction);
                } else if (declaration.generator) {
                    this.tolerateUnexpectedToken(token, Messages.GeneratorInLegacyContext);
                }
                body = declaration;
            } else {
                body = this.parseStatement();
            }
            delete this.context.labelSet[key];
            statement = new LabeledStatement(id, body);
        } else {
            this.consumeSemicolon();
            statement = new ExpressionStatement(expr);
        }
        return this.finalize(node, statement);
    };
    Parser.prototype.parseThrowStatement = function() {
        var node = this.createNode();
        this.expectKeyword('throw');
        if (this.hasLineTerminator) {
            this.throwError(Messages.NewlineAfterThrow);
        }
        var argument = this.parseExpression();
        this.consumeSemicolon();
        return this.finalize(node, new ThrowStatement(argument));
    };
    Parser.prototype.parseCatchClause = function() {
        var node = this.createNode();
        this.expectKeyword('catch');
        var param = null;
        if (this.match('(')) {
            this.expect('(');
            if (this.match(')')) {
                this.throwUnexpectedToken(this.lookahead);
            }
            var params = [];
            param = this.parsePattern(params);
            var paramMap = {};
            for(var i = 0; i < params.length; i++){
                var key = '$' + params[i].value;
                if (Object.prototype.hasOwnProperty.call(paramMap, key)) {
                    this.tolerateError(Messages.DuplicateBinding, params[i].value);
                }
                paramMap[key] = true;
            }
            if (this.context.strict && param.type === Syntax.Identifier) {
                if (this.scanner.isRestrictedWord(param.name)) {
                    this.tolerateError(Messages.StrictCatchVariable);
                }
            }
            this.expect(')');
        }
        var body = this.parseBlock();
        return this.finalize(node, new CatchClause(param, body));
    };
    Parser.prototype.parseFinallyClause = function() {
        this.expectKeyword('finally');
        return this.parseBlock();
    };
    Parser.prototype.parseTryStatement = function() {
        var node = this.createNode();
        this.expectKeyword('try');
        var block = this.parseBlock();
        var handler = this.matchKeyword('catch') ? this.parseCatchClause() : null;
        var finalizer = this.matchKeyword('finally') ? this.parseFinallyClause() : null;
        if (!handler && !finalizer) {
            this.throwError(Messages.NoCatchOrFinally);
        }
        return this.finalize(node, new TryStatement(block, handler, finalizer));
    };
    Parser.prototype.parseDebuggerStatement = function() {
        var node = this.createNode();
        this.expectKeyword('debugger');
        this.consumeSemicolon();
        return this.finalize(node, new DebuggerStatement());
    };
    Parser.prototype.parseStatement = function() {
        var statement;
        switch(this.lookahead.type){
            case 1:
            case 5:
            case 6:
            case 8:
            case 10:
            case 9:
                statement = this.parseExpressionStatement();
                break;
            case 7:
                var value = this.lookahead.value;
                if (value === '{') {
                    statement = this.parseBlock();
                } else if (value === '(') {
                    statement = this.parseExpressionStatement();
                } else if (value === ';') {
                    statement = this.parseEmptyStatement();
                } else {
                    statement = this.parseExpressionStatement();
                }
                break;
            case 3:
                statement = this.matchAsyncFunction() ? this.parseFunctionDeclaration() : this.parseLabelledStatement();
                break;
            case 4:
                switch(this.lookahead.value){
                    case 'break':
                        statement = this.parseBreakStatement();
                        break;
                    case 'continue':
                        statement = this.parseContinueStatement();
                        break;
                    case 'debugger':
                        statement = this.parseDebuggerStatement();
                        break;
                    case 'do':
                        statement = this.parseDoWhileStatement();
                        break;
                    case 'for':
                        statement = this.parseForStatement();
                        break;
                    case 'function':
                        statement = this.parseFunctionDeclaration();
                        break;
                    case 'if':
                        statement = this.parseIfStatement();
                        break;
                    case 'return':
                        statement = this.parseReturnStatement();
                        break;
                    case 'switch':
                        statement = this.parseSwitchStatement();
                        break;
                    case 'throw':
                        statement = this.parseThrowStatement();
                        break;
                    case 'try':
                        statement = this.parseTryStatement();
                        break;
                    case 'var':
                        statement = this.parseVariableStatement();
                        break;
                    case 'while':
                        statement = this.parseWhileStatement();
                        break;
                    case 'with':
                        statement = this.parseWithStatement();
                        break;
                    default:
                        statement = this.parseExpressionStatement();
                        break;
                }
                break;
            default:
                statement = this.throwUnexpectedToken(this.lookahead);
        }
        return statement;
    };
    Parser.prototype.parseFunctionSourceElements = function() {
        var node = this.createNode();
        this.expect('{');
        var body = this.parseDirectivePrologues();
        var previousLabelSet = this.context.labelSet;
        var previousInIteration = this.context.inIteration;
        var previousInSwitch = this.context.inSwitch;
        var previousInFunctionBody = this.context.inFunctionBody;
        this.context.labelSet = {};
        this.context.inIteration = false;
        this.context.inSwitch = false;
        this.context.inFunctionBody = true;
        while(this.lookahead.type !== 2){
            if (this.match('}')) {
                break;
            }
            body.push(this.parseStatementListItem());
        }
        this.expect('}');
        this.context.labelSet = previousLabelSet;
        this.context.inIteration = previousInIteration;
        this.context.inSwitch = previousInSwitch;
        this.context.inFunctionBody = previousInFunctionBody;
        return this.finalize(node, new BlockStatement(body));
    };
    Parser.prototype.validateParam = function(options, param, name) {
        var key = '$' + name;
        if (this.context.strict) {
            if (this.scanner.isRestrictedWord(name)) {
                options.stricted = param;
                options.message = Messages.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                options.stricted = param;
                options.hasDuplicateParameterNames = true;
            }
        } else if (!options.firstRestricted) {
            if (this.scanner.isRestrictedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictParamName;
            } else if (this.scanner.isStrictModeReservedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                options.stricted = param;
                options.hasDuplicateParameterNames = true;
            }
        }
        if (typeof Object.defineProperty === 'function') {
            Object.defineProperty(options.paramSet, key, {
                value: true,
                enumerable: true,
                writable: true,
                configurable: true
            });
        } else {
            options.paramSet[key] = true;
        }
    };
    Parser.prototype.parseRestElement = function(params) {
        var node = this.createNode();
        this.expect('...');
        var arg = this.parsePattern(params);
        if (this.match('=')) {
            this.throwError(Messages.DefaultRestParameter);
        }
        if (!this.match(')')) {
            this.throwError(Messages.ParameterAfterRestParameter);
        }
        return this.finalize(node, new RestElement(arg));
    };
    Parser.prototype.parseFormalParameter = function(options) {
        var params = [];
        var param = this.match('...') ? this.parseRestElement(params) : this.parsePatternWithDefault(params);
        for(var i = 0; i < params.length; i++){
            this.validateParam(options, params[i], params[i].value);
        }
        options.simple = options.simple && param instanceof Identifier;
        options.params.push(param);
    };
    Parser.prototype.parseFormalParameters = function(firstRestricted) {
        var options = {
            simple: true,
            hasDuplicateParameterNames: false,
            params: [],
            firstRestricted: firstRestricted
        };
        this.expect('(');
        if (!this.match(')')) {
            options.paramSet = {};
            while(this.lookahead.type !== 2){
                this.parseFormalParameter(options);
                if (this.match(')')) {
                    break;
                }
                this.expect(',');
                if (this.match(')')) {
                    break;
                }
            }
        }
        this.expect(')');
        if (options.hasDuplicateParameterNames) {
            if (this.context.strict || this.context.isAsync || !options.simple) {
                this.throwError(Messages.DuplicateParameter);
            }
        }
        return {
            simple: options.simple,
            params: options.params,
            stricted: options.stricted,
            firstRestricted: options.firstRestricted,
            message: options.message
        };
    };
    Parser.prototype.matchAsyncFunction = function() {
        var match = this.matchContextualKeyword('async');
        if (match) {
            var state = this.scanner.saveState();
            this.scanner.scanComments();
            var next = this.scanner.lex();
            this.scanner.restoreState(state);
            match = state.lineNumber === next.lineNumber && next.type === 4 && next.value === 'function';
        }
        return match;
    };
    Parser.prototype.parseFunctionDeclaration = function(identifierIsOptional) {
        var node = this.createNode();
        var isAsync = this.matchContextualKeyword('async');
        if (isAsync) {
            if (this.context.inIteration) {
                this.tolerateError(Messages.AsyncFunctionInSingleStatementContext);
            }
            this.nextToken();
        }
        this.expectKeyword('function');
        var isGenerator = this.match('*');
        if (isGenerator) {
            this.nextToken();
        }
        var message;
        var id = null;
        var firstRestricted = null;
        if (!identifierIsOptional || !this.match('(')) {
            var token = this.lookahead;
            id = this.parseVariableIdentifier();
            if (this.context.strict) {
                if (this.scanner.isRestrictedWord(token.value)) {
                    this.tolerateUnexpectedToken(token, Messages.StrictFunctionName);
                }
            } else {
                if (this.scanner.isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (this.scanner.isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }
        var previousIsAsync = this.context.isAsync;
        var previousAllowYield = this.context.allowYield;
        this.context.isAsync = isAsync;
        this.context.allowYield = !isGenerator;
        var formalParameters = this.parseFormalParameters(firstRestricted);
        var params = formalParameters.params;
        var stricted = formalParameters.stricted;
        firstRestricted = formalParameters.firstRestricted;
        if (formalParameters.message) {
            message = formalParameters.message;
        }
        var previousStrict = this.context.strict;
        var previousAllowStrictDirective = this.context.allowStrictDirective;
        this.context.allowStrictDirective = formalParameters.simple;
        var body = this.parseFunctionSourceElements();
        if (this.context.strict && firstRestricted) {
            this.throwUnexpectedToken(firstRestricted, message);
        }
        if (this.context.strict && stricted) {
            this.tolerateUnexpectedToken(stricted, message);
        }
        this.context.strict = previousStrict;
        this.context.allowStrictDirective = previousAllowStrictDirective;
        this.context.isAsync = previousIsAsync;
        this.context.allowYield = previousAllowYield;
        return isAsync ? this.finalize(node, new AsyncFunctionDeclaration(id, params, body, isGenerator)) : this.finalize(node, new FunctionDeclaration(id, params, body, isGenerator));
    };
    Parser.prototype.parseFunctionExpression = function() {
        var node = this.createNode();
        var isAsync = this.matchContextualKeyword('async');
        if (isAsync) {
            this.nextToken();
        }
        this.expectKeyword('function');
        var isGenerator = this.match('*');
        if (isGenerator) {
            this.nextToken();
        }
        var message;
        var id = null;
        var firstRestricted;
        var previousIsAsync = this.context.isAsync;
        var previousAllowYield = this.context.allowYield;
        this.context.isAsync = isAsync;
        this.context.allowYield = !isGenerator;
        if (!this.match('(')) {
            var token = this.lookahead;
            id = !this.context.strict && !isGenerator && this.matchKeyword('yield') ? this.parseIdentifierName() : this.parseVariableIdentifier();
            if (this.context.strict) {
                if (this.scanner.isRestrictedWord(token.value)) {
                    this.tolerateUnexpectedToken(token, Messages.StrictFunctionName);
                }
            } else {
                if (this.scanner.isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (this.scanner.isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }
        var formalParameters = this.parseFormalParameters(firstRestricted);
        var params = formalParameters.params;
        var stricted = formalParameters.stricted;
        firstRestricted = formalParameters.firstRestricted;
        if (formalParameters.message) {
            message = formalParameters.message;
        }
        var previousStrict = this.context.strict;
        var previousAllowStrictDirective = this.context.allowStrictDirective;
        this.context.allowStrictDirective = formalParameters.simple;
        var body = this.parseFunctionSourceElements();
        if (this.context.strict && firstRestricted) {
            this.throwUnexpectedToken(firstRestricted, message);
        }
        if (this.context.strict && stricted) {
            this.tolerateUnexpectedToken(stricted, message);
        }
        this.context.strict = previousStrict;
        this.context.allowStrictDirective = previousAllowStrictDirective;
        this.context.isAsync = previousIsAsync;
        this.context.allowYield = previousAllowYield;
        return isAsync ? this.finalize(node, new AsyncFunctionExpression(id, params, body, isGenerator)) : this.finalize(node, new FunctionExpression(id, params, body, isGenerator));
    };
    Parser.prototype.parseDirective = function() {
        var token = this.lookahead;
        var node = this.createNode();
        var expr = this.parseExpression();
        var directive = expr.type === Syntax.Literal ? this.getTokenRaw(token).slice(1, -1) : null;
        this.consumeSemicolon();
        return this.finalize(node, directive ? new Directive(expr, directive) : new ExpressionStatement(expr));
    };
    Parser.prototype.parseDirectivePrologues = function() {
        var firstRestricted = null;
        var body = [];
        while(true){
            var token = this.lookahead;
            if (token.type !== 8) {
                break;
            }
            var statement = this.parseDirective();
            body.push(statement);
            var directive = statement.directive;
            if (typeof directive !== 'string') {
                break;
            }
            if (directive === 'use strict') {
                this.context.strict = true;
                if (firstRestricted) {
                    this.tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
                }
                if (!this.context.allowStrictDirective) {
                    this.tolerateUnexpectedToken(token, Messages.IllegalLanguageModeDirective);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }
        return body;
    };
    Parser.prototype.qualifiedPropertyName = function(token) {
        switch(token.type){
            case 3:
            case 8:
            case 1:
            case 5:
            case 6:
            case 4:
                return true;
            case 7:
                return token.value === '[';
            default:
                break;
        }
        return false;
    };
    Parser.prototype.parseGetterMethod = function() {
        var node = this.createNode();
        var isGenerator = false;
        var previousAllowYield = this.context.allowYield;
        this.context.allowYield = !isGenerator;
        var formalParameters = this.parseFormalParameters();
        if (formalParameters.params.length > 0) {
            this.tolerateError(Messages.BadGetterArity);
        }
        var method = this.parsePropertyMethod(formalParameters);
        this.context.allowYield = previousAllowYield;
        return this.finalize(node, new FunctionExpression(null, formalParameters.params, method, isGenerator));
    };
    Parser.prototype.parseSetterMethod = function() {
        var node = this.createNode();
        var isGenerator = false;
        var previousAllowYield = this.context.allowYield;
        this.context.allowYield = !isGenerator;
        var formalParameters = this.parseFormalParameters();
        if (formalParameters.params.length !== 1) {
            this.tolerateError(Messages.BadSetterArity);
        } else if (formalParameters.params[0] instanceof RestElement) {
            this.tolerateError(Messages.BadSetterRestParameter);
        }
        var method = this.parsePropertyMethod(formalParameters);
        this.context.allowYield = previousAllowYield;
        return this.finalize(node, new FunctionExpression(null, formalParameters.params, method, isGenerator));
    };
    Parser.prototype.parseGeneratorMethod = function() {
        var node = this.createNode();
        var isGenerator = true;
        var previousAllowYield = this.context.allowYield;
        this.context.allowYield = true;
        var params = this.parseFormalParameters();
        this.context.allowYield = false;
        var method = this.parsePropertyMethod(params);
        this.context.allowYield = previousAllowYield;
        return this.finalize(node, new FunctionExpression(null, params.params, method, isGenerator));
    };
    Parser.prototype.isStartOfExpression = function() {
        var start = true;
        var value = this.lookahead.value;
        switch(this.lookahead.type){
            case 7:
                start = value === '[' || value === '(' || value === '{' || value === '+' || value === '-' || value === '!' || value === '~' || value === '++' || value === '--' || value === '/' || value === '/=';
                break;
            case 4:
                start = value === 'class' || value === 'delete' || value === 'function' || value === 'let' || value === 'new' || value === 'super' || value === 'this' || value === 'typeof' || value === 'void' || value === 'yield';
                break;
            default:
                break;
        }
        return start;
    };
    Parser.prototype.parseYieldExpression = function() {
        var node = this.createNode();
        this.expectKeyword('yield');
        var argument = null;
        var delegate = false;
        if (!this.hasLineTerminator) {
            var previousAllowYield = this.context.allowYield;
            this.context.allowYield = false;
            delegate = this.match('*');
            if (delegate) {
                this.nextToken();
                argument = this.parseAssignmentExpression();
            } else if (this.isStartOfExpression()) {
                argument = this.parseAssignmentExpression();
            }
            this.context.allowYield = previousAllowYield;
        }
        return this.finalize(node, new YieldExpression(argument, delegate));
    };
    Parser.prototype.parseClassElement = function(hasConstructor) {
        var token = this.lookahead;
        var node = this.createNode();
        var kind = '';
        var key = null;
        var value = null;
        var computed = false;
        var method = false;
        var isStatic = false;
        var isAsync = false;
        var isGenerator = false;
        if (this.match('*')) {
            this.nextToken();
        } else {
            computed = this.match('[');
            key = this.parseObjectPropertyKey();
            var id = key;
            if (id.name === 'static' && (this.qualifiedPropertyName(this.lookahead) || this.match('*'))) {
                token = this.lookahead;
                isStatic = true;
                computed = this.match('[');
                if (this.match('*')) {
                    this.nextToken();
                } else {
                    key = this.parseObjectPropertyKey();
                }
            }
            if (token.type === 3 && !this.hasLineTerminator && token.value === 'async') {
                var punctuator = this.lookahead.value;
                if (punctuator !== ':' && punctuator !== '(') {
                    isAsync = true;
                    isGenerator = this.match("*");
                    if (isGenerator) {
                        this.nextToken();
                    }
                    token = this.lookahead;
                    computed = this.match('[');
                    key = this.parseObjectPropertyKey();
                    if (token.type === 3 && token.value === 'constructor') {
                        this.tolerateUnexpectedToken(token, Messages.ConstructorIsAsync);
                    }
                }
            }
        }
        var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
        if (token.type === 3) {
            if (token.value === 'get' && lookaheadPropertyKey) {
                kind = 'get';
                computed = this.match('[');
                key = this.parseObjectPropertyKey();
                this.context.allowYield = false;
                value = this.parseGetterMethod();
            } else if (token.value === 'set' && lookaheadPropertyKey) {
                kind = 'set';
                computed = this.match('[');
                key = this.parseObjectPropertyKey();
                value = this.parseSetterMethod();
            }
        } else if (token.type === 7 && token.value === '*' && lookaheadPropertyKey) {
            kind = 'init';
            computed = this.match('[');
            key = this.parseObjectPropertyKey();
            value = this.parseGeneratorMethod();
            method = true;
        }
        if (!kind && key && this.match('(')) {
            var previousInClassConstructor = this.context.inClassConstructor;
            this.context.inClassConstructor = token.value === 'constructor';
            kind = 'init';
            value = isAsync ? this.parsePropertyMethodAsyncFunction(isGenerator) : this.parsePropertyMethodFunction(isGenerator);
            this.context.inClassConstructor = previousInClassConstructor;
            method = true;
        }
        if (!kind) {
            this.throwUnexpectedToken(this.lookahead);
        }
        if (kind === 'init') {
            kind = 'method';
        }
        if (!computed) {
            if (isStatic && this.isPropertyKey(key, 'prototype')) {
                this.throwUnexpectedToken(token, Messages.StaticPrototype);
            }
            if (!isStatic && this.isPropertyKey(key, 'constructor')) {
                if (kind !== 'method' || !method || value && value.generator) {
                    this.throwUnexpectedToken(token, Messages.ConstructorSpecialMethod);
                }
                if (hasConstructor.value) {
                    this.throwUnexpectedToken(token, Messages.DuplicateConstructor);
                } else {
                    hasConstructor.value = true;
                }
                kind = 'constructor';
            }
        }
        return this.finalize(node, new MethodDefinition(key, computed, value, kind, isStatic));
    };
    Parser.prototype.parseClassElementList = function() {
        var body = [];
        var hasConstructor = {
            value: false
        };
        this.expect('{');
        while(!this.match('}')){
            if (this.match(';')) {
                this.nextToken();
            } else {
                body.push(this.parseClassElement(hasConstructor));
            }
        }
        this.expect('}');
        return body;
    };
    Parser.prototype.parseClassBody = function() {
        var node = this.createNode();
        var elementList = this.parseClassElementList();
        return this.finalize(node, new ClassBody(elementList));
    };
    Parser.prototype.parseClassDeclaration = function(identifierIsOptional) {
        var node = this.createNode();
        var previousStrict = this.context.strict;
        this.context.strict = true;
        this.expectKeyword('class');
        var id = identifierIsOptional && this.lookahead.type !== 3 ? null : this.parseVariableIdentifier();
        var superClass = null;
        if (this.matchKeyword('extends')) {
            this.nextToken();
            superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
        }
        var classBody = this.parseClassBody();
        this.context.strict = previousStrict;
        return this.finalize(node, new ClassDeclaration(id, superClass, classBody));
    };
    Parser.prototype.parseClassExpression = function() {
        var node = this.createNode();
        var previousStrict = this.context.strict;
        this.context.strict = true;
        this.expectKeyword('class');
        var id = this.lookahead.type === 3 ? this.parseVariableIdentifier() : null;
        var superClass = null;
        if (this.matchKeyword('extends')) {
            this.nextToken();
            superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
        }
        var classBody = this.parseClassBody();
        this.context.strict = previousStrict;
        return this.finalize(node, new ClassExpression(id, superClass, classBody));
    };
    Parser.prototype.parseModule = function() {
        this.context.strict = true;
        this.context.isModule = true;
        this.scanner.isModule = true;
        var node = this.createNode();
        var body = this.parseDirectivePrologues();
        while(this.lookahead.type !== 2){
            body.push(this.parseStatementListItem());
        }
        return this.finalize(node, new Module(body));
    };
    Parser.prototype.parseScript = function() {
        var node = this.createNode();
        var body = this.parseDirectivePrologues();
        while(this.lookahead.type !== 2){
            body.push(this.parseStatementListItem());
        }
        return this.finalize(node, new Script(body));
    };
    Parser.prototype.parseModuleSpecifier = function() {
        var node = this.createNode();
        if (this.lookahead.type !== 8) {
            this.throwError(Messages.InvalidModuleSpecifier);
        }
        var token = this.nextToken();
        var raw = this.getTokenRaw(token);
        return this.finalize(node, new Literal(token.value, raw));
    };
    Parser.prototype.parseImportSpecifier = function() {
        var node = this.createNode();
        var imported;
        var local;
        if (this.lookahead.type === 3) {
            imported = this.parseVariableIdentifier();
            local = imported;
            if (this.matchContextualKeyword('as')) {
                this.nextToken();
                local = this.parseVariableIdentifier();
            }
        } else {
            imported = this.parseIdentifierName();
            local = imported;
            if (this.matchContextualKeyword('as')) {
                this.nextToken();
                local = this.parseVariableIdentifier();
            } else {
                this.throwUnexpectedToken(this.nextToken());
            }
        }
        return this.finalize(node, new ImportSpecifier(local, imported));
    };
    Parser.prototype.parseNamedImports = function() {
        this.expect('{');
        var specifiers = [];
        while(!this.match('}')){
            specifiers.push(this.parseImportSpecifier());
            if (!this.match('}')) {
                this.expect(',');
            }
        }
        this.expect('}');
        return specifiers;
    };
    Parser.prototype.parseImportDefaultSpecifier = function() {
        var node = this.createNode();
        var local = this.parseIdentifierName();
        return this.finalize(node, new ImportDefaultSpecifier(local));
    };
    Parser.prototype.parseImportNamespaceSpecifier = function() {
        var node = this.createNode();
        this.expect('*');
        if (!this.matchContextualKeyword('as')) {
            this.throwError(Messages.NoAsAfterImportNamespace);
        }
        this.nextToken();
        var local = this.parseIdentifierName();
        return this.finalize(node, new ImportNamespaceSpecifier(local));
    };
    Parser.prototype.parseImportDeclaration = function() {
        if (this.context.inFunctionBody) {
            this.throwError(Messages.IllegalImportDeclaration);
        }
        var node = this.createNode();
        this.expectKeyword('import');
        var src;
        var specifiers = [];
        if (this.lookahead.type === 8) {
            src = this.parseModuleSpecifier();
        } else {
            if (this.match('{')) {
                specifiers = specifiers.concat(this.parseNamedImports());
            } else if (this.match('*')) {
                specifiers.push(this.parseImportNamespaceSpecifier());
            } else if (this.isIdentifierName(this.lookahead) && !this.matchKeyword('default')) {
                specifiers.push(this.parseImportDefaultSpecifier());
                if (this.match(',')) {
                    this.nextToken();
                    if (this.match('*')) {
                        specifiers.push(this.parseImportNamespaceSpecifier());
                    } else if (this.match('{')) {
                        specifiers = specifiers.concat(this.parseNamedImports());
                    } else {
                        this.throwUnexpectedToken(this.lookahead);
                    }
                }
            } else {
                this.throwUnexpectedToken(this.nextToken());
            }
            if (!this.matchContextualKeyword('from')) {
                var message = this.lookahead.value ? Messages.UnexpectedToken : Messages.MissingFromClause;
                this.throwError(message, this.lookahead.value);
            }
            this.nextToken();
            src = this.parseModuleSpecifier();
        }
        this.consumeSemicolon();
        return this.finalize(node, new ImportDeclaration(specifiers, src));
    };
    Parser.prototype.parseExportSpecifier = function() {
        var node = this.createNode();
        var local = this.parseIdentifierName();
        var exported = local;
        if (this.matchContextualKeyword('as')) {
            this.nextToken();
            exported = this.parseIdentifierName();
        }
        return this.finalize(node, new ExportSpecifier(local, exported));
    };
    Parser.prototype.parseExportDeclaration = function() {
        if (this.context.inFunctionBody) {
            this.throwError(Messages.IllegalExportDeclaration);
        }
        var node = this.createNode();
        this.expectKeyword('export');
        var exportDeclaration;
        if (this.matchKeyword('default')) {
            this.nextToken();
            if (this.matchKeyword('function')) {
                var declaration = this.parseFunctionDeclaration(true);
                exportDeclaration = this.finalize(node, new ExportDefaultDeclaration(declaration));
            } else if (this.matchKeyword('class')) {
                var declaration = this.parseClassDeclaration(true);
                exportDeclaration = this.finalize(node, new ExportDefaultDeclaration(declaration));
            } else if (this.matchContextualKeyword('async')) {
                var declaration = this.matchAsyncFunction() ? this.parseFunctionDeclaration(true) : this.parseAssignmentExpression();
                exportDeclaration = this.finalize(node, new ExportDefaultDeclaration(declaration));
            } else {
                if (this.matchContextualKeyword('from')) {
                    this.throwError(Messages.UnexpectedToken, this.lookahead.value);
                }
                var declaration = this.match('{') ? this.parseObjectInitializer() : this.match('[') ? this.parseArrayInitializer() : this.parseAssignmentExpression();
                this.consumeSemicolon();
                exportDeclaration = this.finalize(node, new ExportDefaultDeclaration(declaration));
            }
        } else if (this.match('*')) {
            this.nextToken();
            if (!this.matchContextualKeyword('from')) {
                var message = this.lookahead.value ? Messages.UnexpectedToken : Messages.MissingFromClause;
                this.throwError(message, this.lookahead.value);
            }
            this.nextToken();
            var src = this.parseModuleSpecifier();
            this.consumeSemicolon();
            exportDeclaration = this.finalize(node, new ExportAllDeclaration(src));
        } else if (this.lookahead.type === 4) {
            var declaration = void 0;
            switch(this.lookahead.value){
                case 'let':
                case 'const':
                    declaration = this.parseLexicalDeclaration({
                        inFor: false
                    });
                    break;
                case 'var':
                case 'class':
                case 'function':
                    declaration = this.parseStatementListItem();
                    break;
                default:
                    this.throwUnexpectedToken(this.lookahead);
            }
            exportDeclaration = this.finalize(node, new ExportNamedDeclaration(declaration, [], null));
        } else if (this.matchAsyncFunction()) {
            var declaration = this.parseFunctionDeclaration();
            exportDeclaration = this.finalize(node, new ExportNamedDeclaration(declaration, [], null));
        } else {
            var specifiers = [];
            var source = null;
            var isExportFromIdentifier = false;
            this.expect('{');
            while(!this.match('}')){
                isExportFromIdentifier = isExportFromIdentifier || this.matchKeyword('default');
                specifiers.push(this.parseExportSpecifier());
                if (!this.match('}')) {
                    this.expect(',');
                }
            }
            this.expect('}');
            if (this.matchContextualKeyword('from')) {
                this.nextToken();
                source = this.parseModuleSpecifier();
                this.consumeSemicolon();
            } else if (isExportFromIdentifier) {
                var message = this.lookahead.value ? Messages.UnexpectedToken : Messages.MissingFromClause;
                this.throwError(message, this.lookahead.value);
            } else {
                this.consumeSemicolon();
            }
            exportDeclaration = this.finalize(node, new ExportNamedDeclaration(null, specifiers, source));
        }
        return exportDeclaration;
    };
    return Parser;
}();
var XHTMLEntities = {
    quot: '\u0022',
    amp: '\u0026',
    apos: '\u0027',
    gt: '\u003E',
    nbsp: '\u00A0',
    iexcl: '\u00A1',
    cent: '\u00A2',
    pound: '\u00A3',
    curren: '\u00A4',
    yen: '\u00A5',
    brvbar: '\u00A6',
    sect: '\u00A7',
    uml: '\u00A8',
    copy: '\u00A9',
    ordf: '\u00AA',
    laquo: '\u00AB',
    not: '\u00AC',
    shy: '\u00AD',
    reg: '\u00AE',
    macr: '\u00AF',
    deg: '\u00B0',
    plusmn: '\u00B1',
    sup2: '\u00B2',
    sup3: '\u00B3',
    acute: '\u00B4',
    micro: '\u00B5',
    para: '\u00B6',
    middot: '\u00B7',
    cedil: '\u00B8',
    sup1: '\u00B9',
    ordm: '\u00BA',
    raquo: '\u00BB',
    frac14: '\u00BC',
    frac12: '\u00BD',
    frac34: '\u00BE',
    iquest: '\u00BF',
    Agrave: '\u00C0',
    Aacute: '\u00C1',
    Acirc: '\u00C2',
    Atilde: '\u00C3',
    Auml: '\u00C4',
    Aring: '\u00C5',
    AElig: '\u00C6',
    Ccedil: '\u00C7',
    Egrave: '\u00C8',
    Eacute: '\u00C9',
    Ecirc: '\u00CA',
    Euml: '\u00CB',
    Igrave: '\u00CC',
    Iacute: '\u00CD',
    Icirc: '\u00CE',
    Iuml: '\u00CF',
    ETH: '\u00D0',
    Ntilde: '\u00D1',
    Ograve: '\u00D2',
    Oacute: '\u00D3',
    Ocirc: '\u00D4',
    Otilde: '\u00D5',
    Ouml: '\u00D6',
    times: '\u00D7',
    Oslash: '\u00D8',
    Ugrave: '\u00D9',
    Uacute: '\u00DA',
    Ucirc: '\u00DB',
    Uuml: '\u00DC',
    Yacute: '\u00DD',
    THORN: '\u00DE',
    szlig: '\u00DF',
    agrave: '\u00E0',
    aacute: '\u00E1',
    acirc: '\u00E2',
    atilde: '\u00E3',
    auml: '\u00E4',
    aring: '\u00E5',
    aelig: '\u00E6',
    ccedil: '\u00E7',
    egrave: '\u00E8',
    eacute: '\u00E9',
    ecirc: '\u00EA',
    euml: '\u00EB',
    igrave: '\u00EC',
    iacute: '\u00ED',
    icirc: '\u00EE',
    iuml: '\u00EF',
    eth: '\u00F0',
    ntilde: '\u00F1',
    ograve: '\u00F2',
    oacute: '\u00F3',
    ocirc: '\u00F4',
    otilde: '\u00F5',
    ouml: '\u00F6',
    divide: '\u00F7',
    oslash: '\u00F8',
    ugrave: '\u00F9',
    uacute: '\u00FA',
    ucirc: '\u00FB',
    uuml: '\u00FC',
    yacute: '\u00FD',
    thorn: '\u00FE',
    yuml: '\u00FF',
    OElig: '\u0152',
    oelig: '\u0153',
    Scaron: '\u0160',
    scaron: '\u0161',
    Yuml: '\u0178',
    fnof: '\u0192',
    circ: '\u02C6',
    tilde: '\u02DC',
    Alpha: '\u0391',
    Beta: '\u0392',
    Gamma: '\u0393',
    Delta: '\u0394',
    Epsilon: '\u0395',
    Zeta: '\u0396',
    Eta: '\u0397',
    Theta: '\u0398',
    Iota: '\u0399',
    Kappa: '\u039A',
    Lambda: '\u039B',
    Mu: '\u039C',
    Nu: '\u039D',
    Xi: '\u039E',
    Omicron: '\u039F',
    Pi: '\u03A0',
    Rho: '\u03A1',
    Sigma: '\u03A3',
    Tau: '\u03A4',
    Upsilon: '\u03A5',
    Phi: '\u03A6',
    Chi: '\u03A7',
    Psi: '\u03A8',
    Omega: '\u03A9',
    alpha: '\u03B1',
    beta: '\u03B2',
    gamma: '\u03B3',
    delta: '\u03B4',
    epsilon: '\u03B5',
    zeta: '\u03B6',
    eta: '\u03B7',
    theta: '\u03B8',
    iota: '\u03B9',
    kappa: '\u03BA',
    lambda: '\u03BB',
    mu: '\u03BC',
    nu: '\u03BD',
    xi: '\u03BE',
    omicron: '\u03BF',
    pi: '\u03C0',
    rho: '\u03C1',
    sigmaf: '\u03C2',
    sigma: '\u03C3',
    tau: '\u03C4',
    upsilon: '\u03C5',
    phi: '\u03C6',
    chi: '\u03C7',
    psi: '\u03C8',
    omega: '\u03C9',
    thetasym: '\u03D1',
    upsih: '\u03D2',
    piv: '\u03D6',
    ensp: '\u2002',
    emsp: '\u2003',
    thinsp: '\u2009',
    zwnj: '\u200C',
    zwj: '\u200D',
    lrm: '\u200E',
    rlm: '\u200F',
    ndash: '\u2013',
    mdash: '\u2014',
    lsquo: '\u2018',
    rsquo: '\u2019',
    sbquo: '\u201A',
    ldquo: '\u201C',
    rdquo: '\u201D',
    bdquo: '\u201E',
    dagger: '\u2020',
    Dagger: '\u2021',
    bull: '\u2022',
    hellip: '\u2026',
    permil: '\u2030',
    prime: '\u2032',
    Prime: '\u2033',
    lsaquo: '\u2039',
    rsaquo: '\u203A',
    oline: '\u203E',
    frasl: '\u2044',
    euro: '\u20AC',
    image: '\u2111',
    weierp: '\u2118',
    real: '\u211C',
    trade: '\u2122',
    alefsym: '\u2135',
    larr: '\u2190',
    uarr: '\u2191',
    rarr: '\u2192',
    darr: '\u2193',
    harr: '\u2194',
    crarr: '\u21B5',
    lArr: '\u21D0',
    uArr: '\u21D1',
    rArr: '\u21D2',
    dArr: '\u21D3',
    hArr: '\u21D4',
    forall: '\u2200',
    part: '\u2202',
    exist: '\u2203',
    empty: '\u2205',
    nabla: '\u2207',
    isin: '\u2208',
    notin: '\u2209',
    ni: '\u220B',
    prod: '\u220F',
    sum: '\u2211',
    minus: '\u2212',
    lowast: '\u2217',
    radic: '\u221A',
    prop: '\u221D',
    infin: '\u221E',
    ang: '\u2220',
    and: '\u2227',
    or: '\u2228',
    cap: '\u2229',
    cup: '\u222A',
    int: '\u222B',
    there4: '\u2234',
    sim: '\u223C',
    cong: '\u2245',
    asymp: '\u2248',
    ne: '\u2260',
    equiv: '\u2261',
    le: '\u2264',
    ge: '\u2265',
    sub: '\u2282',
    sup: '\u2283',
    nsub: '\u2284',
    sube: '\u2286',
    supe: '\u2287',
    oplus: '\u2295',
    otimes: '\u2297',
    perp: '\u22A5',
    sdot: '\u22C5',
    lceil: '\u2308',
    rceil: '\u2309',
    lfloor: '\u230A',
    rfloor: '\u230B',
    loz: '\u25CA',
    spades: '\u2660',
    clubs: '\u2663',
    hearts: '\u2665',
    diams: '\u2666',
    lang: '\u27E8',
    rang: '\u27E9'
};
var __extends = this && this.__extends || function() {
    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || ({
            __proto__: []
        }) instanceof Array && function(d, b) {
            d.__proto__ = b;
        } || function(d, b) {
            for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
        return extendStatics(d, b);
    };
    return function(d, b) {
        if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
TokenName[100] = 'JSXIdentifier';
TokenName[101] = 'JSXText';
function getQualifiedElementName(elementName) {
    var qualifiedName;
    switch(elementName.type){
        case JSXSyntax.JSXIdentifier:
            var id = elementName;
            qualifiedName = id.name;
            break;
        case JSXSyntax.JSXNamespacedName:
            var ns = elementName;
            qualifiedName = getQualifiedElementName(ns.namespace) + ':' + getQualifiedElementName(ns.name);
            break;
        case JSXSyntax.JSXMemberExpression:
            var expr = elementName;
            qualifiedName = getQualifiedElementName(expr.object) + '.' + getQualifiedElementName(expr.property);
            break;
        default:
            break;
    }
    return qualifiedName;
}
var JSXParser = function(_super) {
    __extends(JSXParser, _super);
    function JSXParser(code, options, delegate) {
        return _super.call(this, code, options, delegate) || this;
    }
    JSXParser.prototype.parsePrimaryExpression = function() {
        return this.match('<') ? this.parseJSXRoot() : _super.prototype.parsePrimaryExpression.call(this);
    };
    JSXParser.prototype.startJSX = function() {
        this.scanner.index = this.startMarker.index;
        this.scanner.lineNumber = this.startMarker.line;
        this.scanner.lineStart = this.startMarker.index - this.startMarker.column;
    };
    JSXParser.prototype.finishJSX = function() {
        this.nextToken();
    };
    JSXParser.prototype.reenterJSX = function() {
        this.startJSX();
        this.expectJSX('}');
        if (this.config.tokens) {
            this.tokens.pop();
        }
    };
    JSXParser.prototype.createJSXNode = function() {
        this.collectComments();
        return {
            index: this.scanner.index,
            line: this.scanner.lineNumber,
            column: this.scanner.index - this.scanner.lineStart
        };
    };
    JSXParser.prototype.createJSXChildNode = function() {
        return {
            index: this.scanner.index,
            line: this.scanner.lineNumber,
            column: this.scanner.index - this.scanner.lineStart
        };
    };
    JSXParser.prototype.scanXHTMLEntity = function(quote) {
        var result = '&';
        var valid = true;
        var terminated = false;
        var numeric = false;
        var hex = false;
        while(!this.scanner.eof() && valid && !terminated){
            var ch = this.scanner.source[this.scanner.index];
            if (ch === quote) {
                break;
            }
            terminated = ch === ';';
            result += ch;
            ++this.scanner.index;
            if (!terminated) {
                switch(result.length){
                    case 2:
                        numeric = ch === '#';
                        break;
                    case 3:
                        if (numeric) {
                            hex = ch === 'x';
                            valid = hex || Character.isDecimalDigit(ch.charCodeAt(0));
                            numeric = numeric && !hex;
                        }
                        break;
                    default:
                        valid = valid && !(numeric && !Character.isDecimalDigit(ch.charCodeAt(0)));
                        valid = valid && !(hex && !Character.isHexDigit(ch.charCodeAt(0)));
                        break;
                }
            }
        }
        if (valid && terminated && result.length > 2) {
            var str = result.substr(1, result.length - 2);
            if (numeric && str.length > 1) {
                result = String.fromCharCode(parseInt(str.substr(1), 10));
            } else if (hex && str.length > 2) {
                result = String.fromCharCode(parseInt('0' + str.substr(1), 16));
            } else if (!numeric && !hex && XHTMLEntities[str]) {
                result = XHTMLEntities[str];
            }
        }
        return result;
    };
    JSXParser.prototype.lexJSX = function() {
        var cp = this.scanner.source.charCodeAt(this.scanner.index);
        if (cp === 60 || cp === 62 || cp === 47 || cp === 58 || cp === 61 || cp === 123 || cp === 125) {
            var value = this.scanner.source[this.scanner.index++];
            return {
                type: 7,
                value: value,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: this.scanner.index - 1,
                end: this.scanner.index
            };
        }
        if (cp === 34 || cp === 39) {
            var start = this.scanner.index;
            var quote = this.scanner.source[this.scanner.index++];
            var str = '';
            while(!this.scanner.eof()){
                var ch = this.scanner.source[this.scanner.index++];
                if (ch === quote) {
                    break;
                } else if (ch === '&') {
                    str += this.scanXHTMLEntity(quote);
                } else {
                    str += ch;
                }
            }
            return {
                type: 8,
                value: str,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: start,
                end: this.scanner.index
            };
        }
        if (cp === 46) {
            var n1 = this.scanner.source.charCodeAt(this.scanner.index + 1);
            var n2 = this.scanner.source.charCodeAt(this.scanner.index + 2);
            var value = n1 === 46 && n2 === 46 ? '...' : '.';
            var start = this.scanner.index;
            this.scanner.index += value.length;
            return {
                type: 7,
                value: value,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: start,
                end: this.scanner.index
            };
        }
        if (cp === 96) {
            return {
                type: 10,
                value: '',
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: this.scanner.index,
                end: this.scanner.index
            };
        }
        if (Character.isIdentifierStart(cp) && cp !== 92) {
            var start = this.scanner.index;
            ++this.scanner.index;
            while(!this.scanner.eof()){
                var ch = this.scanner.source.charCodeAt(this.scanner.index);
                if (Character.isIdentifierPart(ch) && ch !== 92) {
                    ++this.scanner.index;
                } else if (ch === 45) {
                    ++this.scanner.index;
                } else {
                    break;
                }
            }
            var id = this.scanner.source.slice(start, this.scanner.index);
            return {
                type: 100,
                value: id,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: start,
                end: this.scanner.index
            };
        }
        return this.scanner.lex();
    };
    JSXParser.prototype.nextJSXToken = function() {
        this.collectComments();
        this.startMarker.index = this.scanner.index;
        this.startMarker.line = this.scanner.lineNumber;
        this.startMarker.column = this.scanner.index - this.scanner.lineStart;
        var token = this.lexJSX();
        this.lastMarker.index = this.scanner.index;
        this.lastMarker.line = this.scanner.lineNumber;
        this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
        if (this.config.tokens) {
            this.tokens.push(this.convertToken(token));
        }
        return token;
    };
    JSXParser.prototype.nextJSXText = function() {
        this.startMarker.index = this.scanner.index;
        this.startMarker.line = this.scanner.lineNumber;
        this.startMarker.column = this.scanner.index - this.scanner.lineStart;
        var start = this.scanner.index;
        var text = '';
        while(!this.scanner.eof()){
            var ch = this.scanner.source[this.scanner.index];
            if (ch === '{' || ch === '<') {
                break;
            }
            ++this.scanner.index;
            text += ch;
            if (Character.isLineTerminator(ch.charCodeAt(0))) {
                ++this.scanner.lineNumber;
                if (ch === '\r' && this.scanner.source[this.scanner.index] === '\n') {
                    ++this.scanner.index;
                }
                this.scanner.lineStart = this.scanner.index;
            }
        }
        this.lastMarker.index = this.scanner.index;
        this.lastMarker.line = this.scanner.lineNumber;
        this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
        var token = {
            type: 101,
            value: text,
            lineNumber: this.scanner.lineNumber,
            lineStart: this.scanner.lineStart,
            start: start,
            end: this.scanner.index
        };
        if (text.length > 0 && this.config.tokens) {
            this.tokens.push(this.convertToken(token));
        }
        return token;
    };
    JSXParser.prototype.peekJSXToken = function() {
        var state = this.scanner.saveState();
        this.scanner.scanComments();
        var next = this.lexJSX();
        this.scanner.restoreState(state);
        return next;
    };
    JSXParser.prototype.expectJSX = function(value) {
        var token = this.nextJSXToken();
        if (token.type !== 7 || token.value !== value) {
            this.throwUnexpectedToken(token);
        }
    };
    JSXParser.prototype.matchJSX = function(value) {
        var next = this.peekJSXToken();
        return next.type === 7 && next.value === value;
    };
    JSXParser.prototype.parseJSXIdentifier = function() {
        var node = this.createJSXNode();
        var token = this.nextJSXToken();
        if (token.type !== 100) {
            this.throwUnexpectedToken(token);
        }
        return this.finalize(node, new JSXIdentifier(token.value));
    };
    JSXParser.prototype.parseJSXElementName = function() {
        var node = this.createJSXNode();
        var elementName = this.parseJSXIdentifier();
        if (this.matchJSX(':')) {
            var namespace = elementName;
            this.expectJSX(':');
            var name_1 = this.parseJSXIdentifier();
            elementName = this.finalize(node, new JSXNamespacedName(namespace, name_1));
        } else if (this.matchJSX('.')) {
            while(this.matchJSX('.')){
                var object = elementName;
                this.expectJSX('.');
                var property = this.parseJSXIdentifier();
                elementName = this.finalize(node, new JSXMemberExpression(object, property));
            }
        }
        return elementName;
    };
    JSXParser.prototype.parseJSXAttributeName = function() {
        var node = this.createJSXNode();
        var attributeName;
        var identifier = this.parseJSXIdentifier();
        if (this.matchJSX(':')) {
            var namespace = identifier;
            this.expectJSX(':');
            var name_2 = this.parseJSXIdentifier();
            attributeName = this.finalize(node, new JSXNamespacedName(namespace, name_2));
        } else {
            attributeName = identifier;
        }
        return attributeName;
    };
    JSXParser.prototype.parseJSXStringLiteralAttribute = function() {
        var node = this.createJSXNode();
        var token = this.nextJSXToken();
        if (token.type !== 8) {
            this.throwUnexpectedToken(token);
        }
        var raw = this.getTokenRaw(token);
        return this.finalize(node, new Literal(token.value, raw));
    };
    JSXParser.prototype.parseJSXExpressionAttribute = function() {
        var node = this.createJSXNode();
        this.expectJSX('{');
        this.finishJSX();
        if (this.match('}')) {
            this.tolerateError('JSX attributes must only be assigned a non-empty expression');
        }
        var expression = this.parseAssignmentExpression();
        this.reenterJSX();
        return this.finalize(node, new JSXExpressionContainer(expression));
    };
    JSXParser.prototype.parseJSXAttributeValue = function() {
        return this.matchJSX('{') ? this.parseJSXExpressionAttribute() : this.matchJSX('<') ? this.parseJSXElement() : this.parseJSXStringLiteralAttribute();
    };
    JSXParser.prototype.parseJSXNameValueAttribute = function() {
        var node = this.createJSXNode();
        var name = this.parseJSXAttributeName();
        var value = null;
        if (this.matchJSX('=')) {
            this.expectJSX('=');
            value = this.parseJSXAttributeValue();
        }
        return this.finalize(node, new JSXAttribute(name, value));
    };
    JSXParser.prototype.parseJSXSpreadAttribute = function() {
        var node = this.createJSXNode();
        this.expectJSX('{');
        this.expectJSX('...');
        this.finishJSX();
        var argument = this.parseAssignmentExpression();
        this.reenterJSX();
        return this.finalize(node, new JSXSpreadAttribute(argument));
    };
    JSXParser.prototype.parseJSXAttributes = function() {
        var attributes = [];
        while(!this.matchJSX('/') && !this.matchJSX('>')){
            var attribute = this.matchJSX('{') ? this.parseJSXSpreadAttribute() : this.parseJSXNameValueAttribute();
            attributes.push(attribute);
        }
        return attributes;
    };
    JSXParser.prototype.parseJSXOpeningElement = function() {
        var node = this.createJSXNode();
        this.expectJSX('<');
        if (this.matchJSX('>')) {
            this.expectJSX('>');
            return this.finalize(node, new JSXOpeningFragment(false));
        }
        var name = this.parseJSXElementName();
        var attributes = this.parseJSXAttributes();
        var selfClosing = this.matchJSX('/');
        if (selfClosing) {
            this.expectJSX('/');
        }
        this.expectJSX('>');
        return this.finalize(node, new JSXOpeningElement(name, selfClosing, attributes));
    };
    JSXParser.prototype.parseJSXBoundaryElement = function() {
        var node = this.createJSXNode();
        this.expectJSX('<');
        if (this.matchJSX('/')) {
            this.expectJSX('/');
            if (this.matchJSX('>')) {
                this.expectJSX('>');
                return this.finalize(node, new JSXClosingFragment());
            }
            var elementName = this.parseJSXElementName();
            this.expectJSX('>');
            return this.finalize(node, new JSXClosingElement(elementName));
        }
        var name = this.parseJSXElementName();
        var attributes = this.parseJSXAttributes();
        var selfClosing = this.matchJSX('/');
        if (selfClosing) {
            this.expectJSX('/');
        }
        this.expectJSX('>');
        return this.finalize(node, new JSXOpeningElement(name, selfClosing, attributes));
    };
    JSXParser.prototype.parseJSXEmptyExpression = function() {
        var node = this.createJSXChildNode();
        this.collectComments();
        this.lastMarker.index = this.scanner.index;
        this.lastMarker.line = this.scanner.lineNumber;
        this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
        return this.finalize(node, new JSXEmptyExpression());
    };
    JSXParser.prototype.parseJSXExpressionContainer = function() {
        var node = this.createJSXNode();
        this.expectJSX('{');
        var expression;
        if (this.matchJSX('}')) {
            expression = this.parseJSXEmptyExpression();
            this.expectJSX('}');
        } else {
            this.finishJSX();
            expression = this.parseAssignmentExpression();
            this.reenterJSX();
        }
        return this.finalize(node, new JSXExpressionContainer(expression));
    };
    JSXParser.prototype.parseJSXChildren = function() {
        var children = [];
        while(!this.scanner.eof()){
            var node = this.createJSXChildNode();
            var token = this.nextJSXText();
            if (token.start < token.end) {
                var raw = this.getTokenRaw(token);
                var child = this.finalize(node, new JSXText(token.value, raw));
                children.push(child);
            }
            if (this.scanner.source[this.scanner.index] === '{') {
                var container = this.parseJSXExpressionContainer();
                children.push(container);
            } else {
                break;
            }
        }
        return children;
    };
    JSXParser.prototype.parseComplexJSXElement = function(el) {
        var stack = [];
        while(!this.scanner.eof()){
            el.children = el.children.concat(this.parseJSXChildren());
            var node = this.createJSXChildNode();
            var element = this.parseJSXBoundaryElement();
            if (element.type === JSXSyntax.JSXOpeningElement) {
                var opening = element;
                if (opening.selfClosing) {
                    var child = this.finalize(node, new JSXElement(opening, [], null));
                    el.children.push(child);
                } else {
                    stack.push(el);
                    el = {
                        node: node,
                        opening: opening,
                        closing: null,
                        children: []
                    };
                }
            }
            if (element.type === JSXSyntax.JSXClosingElement) {
                el.closing = element;
                var open_1 = getQualifiedElementName(el.opening.name);
                var close_1 = getQualifiedElementName(el.closing.name);
                if (open_1 !== close_1) {
                    this.tolerateError('Expected corresponding JSX closing tag for %0', open_1);
                }
                if (stack.length > 0) {
                    var child = this.finalize(el.node, new JSXElement(el.opening, el.children, el.closing));
                    el = stack[stack.length - 1];
                    el.children.push(child);
                    stack.pop();
                } else {
                    break;
                }
            }
            if (element.type === JSXSyntax.JSXClosingFragment) {
                el.closing = element;
                if (el.opening.type !== JSXSyntax.JSXOpeningFragment) {
                    this.tolerateError('Expected corresponding JSX closing tag for jsx fragment');
                } else {
                    break;
                }
            }
        }
        return el;
    };
    JSXParser.prototype.parseJSXElement = function() {
        var node = this.createJSXNode();
        var opening = this.parseJSXOpeningElement();
        var children = [];
        var closing = null;
        if (!opening.selfClosing) {
            var el = this.parseComplexJSXElement({
                node: node,
                opening: opening,
                closing: closing,
                children: children
            });
            children = el.children;
            closing = el.closing;
        }
        return this.finalize(node, new JSXElement(opening, children, closing));
    };
    JSXParser.prototype.parseJSXRoot = function() {
        if (this.config.tokens) {
            this.tokens.pop();
        }
        this.startJSX();
        var element = this.parseJSXElement();
        this.finishJSX();
        return element;
    };
    JSXParser.prototype.isStartOfExpression = function() {
        return _super.prototype.isStartOfExpression.call(this) || this.match('<');
    };
    return JSXParser;
}(Parser);
var Reader = function() {
    function Reader() {
        this.values = [];
        this.curly = this.paren = -1;
    }
    Reader.prototype.beforeFunctionExpression = function(t) {
        return [
            '(',
            '{',
            '[',
            'in',
            'typeof',
            'instanceof',
            'new',
            'return',
            'case',
            'delete',
            'throw',
            'void',
            '=',
            '+=',
            '-=',
            '*=',
            '**=',
            '/=',
            '%=',
            '<<=',
            '>>=',
            '>>>=',
            '&=',
            '|=',
            '^=',
            ',',
            '+',
            '-',
            '*',
            '**',
            '/',
            '%',
            '++',
            '--',
            '<<',
            '>>',
            '>>>',
            '&',
            '|',
            '^',
            '!',
            '~',
            '&&',
            '||',
            '??',
            '?',
            ':',
            '===',
            '==',
            '>=',
            '<=',
            '<',
            '>',
            '!=',
            '!=='
        ].indexOf(t) >= 0;
    };
    Reader.prototype.isRegexStart = function() {
        var previous = this.values[this.values.length - 1];
        var regex = previous !== null;
        switch(previous){
            case 'this':
            case ']':
                regex = false;
                break;
            case ')':
                var keyword = this.values[this.paren - 1];
                regex = keyword === 'if' || keyword === 'while' || keyword === 'for' || keyword === 'with';
                break;
            case '}':
                regex = true;
                if (this.values[this.curly - 3] === 'function') {
                    var check = this.values[this.curly - 4];
                    regex = check ? !this.beforeFunctionExpression(check) : false;
                } else if (this.values[this.curly - 4] === 'function') {
                    var check = this.values[this.curly - 5];
                    regex = check ? !this.beforeFunctionExpression(check) : true;
                }
                break;
            default:
                break;
        }
        return regex;
    };
    Reader.prototype.push = function(token) {
        if (token.type === 7 || token.type === 4) {
            if (token.value === '{') {
                this.curly = this.values.length;
            } else if (token.value === '(') {
                this.paren = this.values.length;
            }
            this.values.push(token.value);
        } else {
            this.values.push(null);
        }
    };
    return Reader;
}();
var Tokenizer = function() {
    function Tokenizer(code, config) {
        this.errorHandler = new ErrorHandler();
        this.errorHandler.tolerant = config ? typeof config.tolerant === 'boolean' && config.tolerant : false;
        this.scanner = new Scanner(code, this.errorHandler);
        this.scanner.trackComment = config ? typeof config.comment === 'boolean' && config.comment : false;
        this.trackRange = config ? typeof config.range === 'boolean' && config.range : false;
        this.trackLoc = config ? typeof config.loc === 'boolean' && config.loc : false;
        this.buffer = [];
        this.reader = new Reader();
    }
    Tokenizer.prototype.errors = function() {
        return this.errorHandler.errors;
    };
    Tokenizer.prototype.getNextToken = function() {
        if (this.buffer.length === 0) {
            var comments = this.scanner.scanComments();
            if (this.scanner.trackComment) {
                for(var i = 0; i < comments.length; ++i){
                    var e = comments[i];
                    var value = this.scanner.source.slice(e.slice[0], e.slice[1]);
                    var comment = {
                        type: e.multiLine ? 'BlockComment' : 'LineComment',
                        value: value
                    };
                    if (this.trackRange) {
                        comment.range = e.range;
                    }
                    if (this.trackLoc) {
                        comment.loc = e.loc;
                    }
                    this.buffer.push(comment);
                }
            }
            if (!this.scanner.eof()) {
                var loc = void 0;
                if (this.trackLoc) {
                    loc = {
                        start: {
                            line: this.scanner.lineNumber,
                            column: this.scanner.index - this.scanner.lineStart
                        },
                        end: {}
                    };
                }
                var maybeRegex = this.scanner.source[this.scanner.index] === '/' && this.reader.isRegexStart();
                var token = void 0;
                if (maybeRegex) {
                    var state = this.scanner.saveState();
                    try {
                        token = this.scanner.scanRegExp();
                    } catch (e1) {
                        this.scanner.restoreState(state);
                        token = this.scanner.lex();
                    }
                } else {
                    token = this.scanner.lex();
                }
                this.reader.push(token);
                var entry = {
                    type: TokenName[token.type],
                    value: this.scanner.source.slice(token.start, token.end)
                };
                if (this.trackRange) {
                    entry.range = [
                        token.start,
                        token.end
                    ];
                }
                if (this.trackLoc) {
                    loc.end = {
                        line: this.scanner.lineNumber,
                        column: this.scanner.index - this.scanner.lineStart
                    };
                    entry.loc = loc;
                }
                if (token.type === 9) {
                    var pattern = token.pattern;
                    var flags = token.flags;
                    entry.regex = {
                        pattern: pattern,
                        flags: flags
                    };
                }
                this.buffer.push(entry);
            }
        }
        return this.buffer.shift();
    };
    return Tokenizer;
}();
function parse(code, options, delegate) {
    var commentHandler = null;
    var proxyDelegate = function(node, metadata) {
        if (delegate) {
            delegate(node, metadata);
        }
        if (commentHandler) {
            commentHandler.visit(node, metadata);
        }
    };
    var parserDelegate = typeof delegate === 'function' ? proxyDelegate : null;
    var collectComment = false;
    if (options) {
        collectComment = typeof options.comment === 'boolean' && options.comment;
        var attachComment = typeof options.attachComment === 'boolean' && options.attachComment;
        if (collectComment || attachComment) {
            commentHandler = new CommentHandler();
            commentHandler.attach = attachComment;
            options.comment = true;
            parserDelegate = proxyDelegate;
        }
    }
    var isModule = false;
    if (options && typeof options.sourceType === 'string') {
        isModule = options.sourceType === 'module';
    }
    var parser;
    if (options && typeof options.jsx === 'boolean' && options.jsx) {
        parser = new JSXParser(code, options, parserDelegate);
    } else {
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
function parseModule(code, options, delegate) {
    var parsingOptions = options || {};
    parsingOptions.sourceType = 'module';
    return parse(code, parsingOptions, delegate);
}
function parseScript(code, options, delegate) {
    var parsingOptions = options || {};
    parsingOptions.sourceType = 'script';
    return parse(code, parsingOptions, delegate);
}
function tokenize(code, options, delegate) {
    var tokenizer = new Tokenizer(code, options);
    var tokens = [];
    try {
        while(true){
            var token = tokenizer.getNextToken();
            if (!token) {
                break;
            }
            if (delegate) {
                token = delegate(token);
            }
            tokens.push(token);
        }
    } catch (e) {
        tokenizer.errorHandler.tolerate(e);
    }
    if (tokenizer.errorHandler.tolerant) {
        tokens.errors = tokenizer.errors();
    }
    return tokens;
}
export { Syntax as Syntax };
var version = '4.0.0-dev';
export { parse as parse };
export { parseModule as parseModule };
export { parseScript as parseScript };
export { tokenize as tokenize };
export { version as version };

