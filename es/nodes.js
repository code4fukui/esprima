import { Syntax } from './syntax.js';
var ArrayExpression = /** @class */ (function () {
    function ArrayExpression(elements) {
        this.type = Syntax.ArrayExpression;
        this.elements = elements;
    }
    return ArrayExpression;
}());
export { ArrayExpression };
var ArrayPattern = /** @class */ (function () {
    function ArrayPattern(elements) {
        this.type = Syntax.ArrayPattern;
        this.elements = elements;
    }
    return ArrayPattern;
}());
export { ArrayPattern };
var ArrowFunctionExpression = /** @class */ (function () {
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
}());
export { ArrowFunctionExpression };
var AssignmentExpression = /** @class */ (function () {
    function AssignmentExpression(operator, left, right) {
        this.type = Syntax.AssignmentExpression;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    return AssignmentExpression;
}());
export { AssignmentExpression };
var AssignmentPattern = /** @class */ (function () {
    function AssignmentPattern(left, right) {
        this.type = Syntax.AssignmentPattern;
        this.left = left;
        this.right = right;
    }
    return AssignmentPattern;
}());
export { AssignmentPattern };
var AsyncArrowFunctionExpression = /** @class */ (function () {
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
}());
export { AsyncArrowFunctionExpression };
var AsyncFunctionDeclaration = /** @class */ (function () {
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
}());
export { AsyncFunctionDeclaration };
var AsyncFunctionExpression = /** @class */ (function () {
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
}());
export { AsyncFunctionExpression };
var AwaitExpression = /** @class */ (function () {
    function AwaitExpression(argument) {
        this.type = Syntax.AwaitExpression;
        this.argument = argument;
    }
    return AwaitExpression;
}());
export { AwaitExpression };
var BinaryExpression = /** @class */ (function () {
    function BinaryExpression(operator, left, right) {
        var logical = (operator === '||' || operator === '&&' || operator === '??');
        this.type = logical ? Syntax.LogicalExpression : Syntax.BinaryExpression;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    return BinaryExpression;
}());
export { BinaryExpression };
var BlockStatement = /** @class */ (function () {
    function BlockStatement(body) {
        this.type = Syntax.BlockStatement;
        this.body = body;
    }
    return BlockStatement;
}());
export { BlockStatement };
var BreakStatement = /** @class */ (function () {
    function BreakStatement(label) {
        this.type = Syntax.BreakStatement;
        this.label = label;
    }
    return BreakStatement;
}());
export { BreakStatement };
var CallExpression = /** @class */ (function () {
    function CallExpression(callee, args, optional) {
        this.type = Syntax.CallExpression;
        this.callee = callee;
        this.arguments = args;
        this.optional = optional;
    }
    return CallExpression;
}());
export { CallExpression };
var CatchClause = /** @class */ (function () {
    function CatchClause(param, body) {
        this.type = Syntax.CatchClause;
        this.param = param;
        this.body = body;
    }
    return CatchClause;
}());
export { CatchClause };
var ChainExpression = /** @class */ (function () {
    function ChainExpression(expression) {
        this.type = Syntax.ChainExpression;
        this.expression = expression;
    }
    return ChainExpression;
}());
export { ChainExpression };
var ClassBody = /** @class */ (function () {
    function ClassBody(body) {
        this.type = Syntax.ClassBody;
        this.body = body;
    }
    return ClassBody;
}());
export { ClassBody };
var ClassDeclaration = /** @class */ (function () {
    function ClassDeclaration(id, superClass, body) {
        this.type = Syntax.ClassDeclaration;
        this.id = id;
        this.superClass = superClass;
        this.body = body;
    }
    return ClassDeclaration;
}());
export { ClassDeclaration };
var ClassExpression = /** @class */ (function () {
    function ClassExpression(id, superClass, body) {
        this.type = Syntax.ClassExpression;
        this.id = id;
        this.superClass = superClass;
        this.body = body;
    }
    return ClassExpression;
}());
export { ClassExpression };
var ComputedMemberExpression = /** @class */ (function () {
    function ComputedMemberExpression(object, property, optional) {
        this.type = Syntax.MemberExpression;
        this.computed = true;
        this.object = object;
        this.property = property;
        this.optional = optional;
    }
    return ComputedMemberExpression;
}());
export { ComputedMemberExpression };
var ConditionalExpression = /** @class */ (function () {
    function ConditionalExpression(test, consequent, alternate) {
        this.type = Syntax.ConditionalExpression;
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    return ConditionalExpression;
}());
export { ConditionalExpression };
var ContinueStatement = /** @class */ (function () {
    function ContinueStatement(label) {
        this.type = Syntax.ContinueStatement;
        this.label = label;
    }
    return ContinueStatement;
}());
export { ContinueStatement };
var DebuggerStatement = /** @class */ (function () {
    function DebuggerStatement() {
        this.type = Syntax.DebuggerStatement;
    }
    return DebuggerStatement;
}());
export { DebuggerStatement };
var Directive = /** @class */ (function () {
    function Directive(expression, directive) {
        this.type = Syntax.ExpressionStatement;
        this.expression = expression;
        this.directive = directive;
    }
    return Directive;
}());
export { Directive };
var DoWhileStatement = /** @class */ (function () {
    function DoWhileStatement(body, test) {
        this.type = Syntax.DoWhileStatement;
        this.body = body;
        this.test = test;
    }
    return DoWhileStatement;
}());
export { DoWhileStatement };
var EmptyStatement = /** @class */ (function () {
    function EmptyStatement() {
        this.type = Syntax.EmptyStatement;
    }
    return EmptyStatement;
}());
export { EmptyStatement };
var ExportAllDeclaration = /** @class */ (function () {
    function ExportAllDeclaration(source) {
        this.type = Syntax.ExportAllDeclaration;
        this.source = source;
    }
    return ExportAllDeclaration;
}());
export { ExportAllDeclaration };
var ExportDefaultDeclaration = /** @class */ (function () {
    function ExportDefaultDeclaration(declaration) {
        this.type = Syntax.ExportDefaultDeclaration;
        this.declaration = declaration;
    }
    return ExportDefaultDeclaration;
}());
export { ExportDefaultDeclaration };
var ExportNamedDeclaration = /** @class */ (function () {
    function ExportNamedDeclaration(declaration, specifiers, source) {
        this.type = Syntax.ExportNamedDeclaration;
        this.declaration = declaration;
        this.specifiers = specifiers;
        this.source = source;
    }
    return ExportNamedDeclaration;
}());
export { ExportNamedDeclaration };
var ExportSpecifier = /** @class */ (function () {
    function ExportSpecifier(local, exported) {
        this.type = Syntax.ExportSpecifier;
        this.exported = exported;
        this.local = local;
    }
    return ExportSpecifier;
}());
export { ExportSpecifier };
var ExpressionStatement = /** @class */ (function () {
    function ExpressionStatement(expression) {
        this.type = Syntax.ExpressionStatement;
        this.expression = expression;
    }
    return ExpressionStatement;
}());
export { ExpressionStatement };
var ForInStatement = /** @class */ (function () {
    function ForInStatement(left, right, body) {
        this.type = Syntax.ForInStatement;
        this.left = left;
        this.right = right;
        this.body = body;
        this.each = false;
    }
    return ForInStatement;
}());
export { ForInStatement };
var ForOfStatement = /** @class */ (function () {
    function ForOfStatement(left, right, body, _await) {
        this.type = Syntax.ForOfStatement;
        this.await = _await;
        this.left = left;
        this.right = right;
        this.body = body;
    }
    return ForOfStatement;
}());
export { ForOfStatement };
var ForStatement = /** @class */ (function () {
    function ForStatement(init, test, update, body) {
        this.type = Syntax.ForStatement;
        this.init = init;
        this.test = test;
        this.update = update;
        this.body = body;
    }
    return ForStatement;
}());
export { ForStatement };
var FunctionDeclaration = /** @class */ (function () {
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
}());
export { FunctionDeclaration };
var FunctionExpression = /** @class */ (function () {
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
}());
export { FunctionExpression };
var Identifier = /** @class */ (function () {
    function Identifier(name) {
        this.type = Syntax.Identifier;
        this.name = name;
    }
    return Identifier;
}());
export { Identifier };
var IfStatement = /** @class */ (function () {
    function IfStatement(test, consequent, alternate) {
        this.type = Syntax.IfStatement;
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    return IfStatement;
}());
export { IfStatement };
var Import = /** @class */ (function () {
    function Import() {
        this.type = Syntax.Import;
    }
    return Import;
}());
export { Import };
var ImportDeclaration = /** @class */ (function () {
    function ImportDeclaration(specifiers, source) {
        this.type = Syntax.ImportDeclaration;
        this.specifiers = specifiers;
        this.source = source;
    }
    return ImportDeclaration;
}());
export { ImportDeclaration };
var ImportDefaultSpecifier = /** @class */ (function () {
    function ImportDefaultSpecifier(local) {
        this.type = Syntax.ImportDefaultSpecifier;
        this.local = local;
    }
    return ImportDefaultSpecifier;
}());
export { ImportDefaultSpecifier };
var ImportNamespaceSpecifier = /** @class */ (function () {
    function ImportNamespaceSpecifier(local) {
        this.type = Syntax.ImportNamespaceSpecifier;
        this.local = local;
    }
    return ImportNamespaceSpecifier;
}());
export { ImportNamespaceSpecifier };
var ImportSpecifier = /** @class */ (function () {
    function ImportSpecifier(local, imported) {
        this.type = Syntax.ImportSpecifier;
        this.local = local;
        this.imported = imported;
    }
    return ImportSpecifier;
}());
export { ImportSpecifier };
var LabeledStatement = /** @class */ (function () {
    function LabeledStatement(label, body) {
        this.type = Syntax.LabeledStatement;
        this.label = label;
        this.body = body;
    }
    return LabeledStatement;
}());
export { LabeledStatement };
var Literal = /** @class */ (function () {
    function Literal(value, raw) {
        this.type = Syntax.Literal;
        this.value = value;
        this.raw = raw;
    }
    return Literal;
}());
export { Literal };
var MetaProperty = /** @class */ (function () {
    function MetaProperty(meta, property) {
        this.type = Syntax.MetaProperty;
        this.meta = meta;
        this.property = property;
    }
    return MetaProperty;
}());
export { MetaProperty };
var MethodDefinition = /** @class */ (function () {
    function MethodDefinition(key, computed, value, kind, isStatic) {
        this.type = Syntax.MethodDefinition;
        this.key = key;
        this.computed = computed;
        this.value = value;
        this.kind = kind;
        this.static = isStatic;
    }
    return MethodDefinition;
}());
export { MethodDefinition };
var Module = /** @class */ (function () {
    function Module(body) {
        this.type = Syntax.Program;
        this.body = body;
        this.sourceType = 'module';
    }
    return Module;
}());
export { Module };
var NewExpression = /** @class */ (function () {
    function NewExpression(callee, args) {
        this.type = Syntax.NewExpression;
        this.callee = callee;
        this.arguments = args;
    }
    return NewExpression;
}());
export { NewExpression };
var ObjectExpression = /** @class */ (function () {
    function ObjectExpression(properties) {
        this.type = Syntax.ObjectExpression;
        this.properties = properties;
    }
    return ObjectExpression;
}());
export { ObjectExpression };
var ObjectPattern = /** @class */ (function () {
    function ObjectPattern(properties) {
        this.type = Syntax.ObjectPattern;
        this.properties = properties;
    }
    return ObjectPattern;
}());
export { ObjectPattern };
var Property = /** @class */ (function () {
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
}());
export { Property };
var RegexLiteral = /** @class */ (function () {
    function RegexLiteral(value, raw, pattern, flags) {
        this.type = Syntax.Literal;
        this.value = value;
        this.raw = raw;
        this.regex = { pattern: pattern, flags: flags };
    }
    return RegexLiteral;
}());
export { RegexLiteral };
var RestElement = /** @class */ (function () {
    function RestElement(argument) {
        this.type = Syntax.RestElement;
        this.argument = argument;
    }
    return RestElement;
}());
export { RestElement };
var ReturnStatement = /** @class */ (function () {
    function ReturnStatement(argument) {
        this.type = Syntax.ReturnStatement;
        this.argument = argument;
    }
    return ReturnStatement;
}());
export { ReturnStatement };
var Script = /** @class */ (function () {
    function Script(body) {
        this.type = Syntax.Program;
        this.body = body;
        this.sourceType = 'script';
    }
    return Script;
}());
export { Script };
var SequenceExpression = /** @class */ (function () {
    function SequenceExpression(expressions) {
        this.type = Syntax.SequenceExpression;
        this.expressions = expressions;
    }
    return SequenceExpression;
}());
export { SequenceExpression };
var SpreadElement = /** @class */ (function () {
    function SpreadElement(argument) {
        this.type = Syntax.SpreadElement;
        this.argument = argument;
    }
    return SpreadElement;
}());
export { SpreadElement };
var StaticMemberExpression = /** @class */ (function () {
    function StaticMemberExpression(object, property, optional) {
        this.type = Syntax.MemberExpression;
        this.computed = false;
        this.object = object;
        this.property = property;
        this.optional = optional;
    }
    return StaticMemberExpression;
}());
export { StaticMemberExpression };
var Super = /** @class */ (function () {
    function Super() {
        this.type = Syntax.Super;
    }
    return Super;
}());
export { Super };
var SwitchCase = /** @class */ (function () {
    function SwitchCase(test, consequent) {
        this.type = Syntax.SwitchCase;
        this.test = test;
        this.consequent = consequent;
    }
    return SwitchCase;
}());
export { SwitchCase };
var SwitchStatement = /** @class */ (function () {
    function SwitchStatement(discriminant, cases) {
        this.type = Syntax.SwitchStatement;
        this.discriminant = discriminant;
        this.cases = cases;
    }
    return SwitchStatement;
}());
export { SwitchStatement };
var TaggedTemplateExpression = /** @class */ (function () {
    function TaggedTemplateExpression(tag, quasi) {
        this.type = Syntax.TaggedTemplateExpression;
        this.tag = tag;
        this.quasi = quasi;
    }
    return TaggedTemplateExpression;
}());
export { TaggedTemplateExpression };
var TemplateElement = /** @class */ (function () {
    function TemplateElement(value, tail) {
        this.type = Syntax.TemplateElement;
        this.value = value;
        this.tail = tail;
    }
    return TemplateElement;
}());
export { TemplateElement };
var TemplateLiteral = /** @class */ (function () {
    function TemplateLiteral(quasis, expressions) {
        this.type = Syntax.TemplateLiteral;
        this.quasis = quasis;
        this.expressions = expressions;
    }
    return TemplateLiteral;
}());
export { TemplateLiteral };
var ThisExpression = /** @class */ (function () {
    function ThisExpression() {
        this.type = Syntax.ThisExpression;
    }
    return ThisExpression;
}());
export { ThisExpression };
var ThrowStatement = /** @class */ (function () {
    function ThrowStatement(argument) {
        this.type = Syntax.ThrowStatement;
        this.argument = argument;
    }
    return ThrowStatement;
}());
export { ThrowStatement };
var TryStatement = /** @class */ (function () {
    function TryStatement(block, handler, finalizer) {
        this.type = Syntax.TryStatement;
        this.block = block;
        this.handler = handler;
        this.finalizer = finalizer;
    }
    return TryStatement;
}());
export { TryStatement };
var UnaryExpression = /** @class */ (function () {
    function UnaryExpression(operator, argument) {
        this.type = Syntax.UnaryExpression;
        this.operator = operator;
        this.argument = argument;
        this.prefix = true;
    }
    return UnaryExpression;
}());
export { UnaryExpression };
var UpdateExpression = /** @class */ (function () {
    function UpdateExpression(operator, argument, prefix) {
        this.type = Syntax.UpdateExpression;
        this.operator = operator;
        this.argument = argument;
        this.prefix = prefix;
    }
    return UpdateExpression;
}());
export { UpdateExpression };
var VariableDeclaration = /** @class */ (function () {
    function VariableDeclaration(declarations, kind) {
        this.type = Syntax.VariableDeclaration;
        this.declarations = declarations;
        this.kind = kind;
    }
    return VariableDeclaration;
}());
export { VariableDeclaration };
var VariableDeclarator = /** @class */ (function () {
    function VariableDeclarator(id, init) {
        this.type = Syntax.VariableDeclarator;
        this.id = id;
        this.init = init;
    }
    return VariableDeclarator;
}());
export { VariableDeclarator };
var WhileStatement = /** @class */ (function () {
    function WhileStatement(test, body) {
        this.type = Syntax.WhileStatement;
        this.test = test;
        this.body = body;
    }
    return WhileStatement;
}());
export { WhileStatement };
var WithStatement = /** @class */ (function () {
    function WithStatement(object, body) {
        this.type = Syntax.WithStatement;
        this.object = object;
        this.body = body;
    }
    return WithStatement;
}());
export { WithStatement };
var YieldExpression = /** @class */ (function () {
    function YieldExpression(argument, delegate) {
        this.type = Syntax.YieldExpression;
        this.argument = argument;
        this.delegate = delegate;
    }
    return YieldExpression;
}());
export { YieldExpression };
