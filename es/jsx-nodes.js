import { JSXSyntax } from './jsx-syntax.js';
var JSXClosingElement = /** @class */ (function () {
    function JSXClosingElement(name) {
        this.type = JSXSyntax.JSXClosingElement;
        this.name = name;
    }
    return JSXClosingElement;
}());
export { JSXClosingElement };
var JSXClosingFragment = /** @class */ (function () {
    function JSXClosingFragment() {
        this.type = JSXSyntax.JSXClosingFragment;
    }
    return JSXClosingFragment;
}());
export { JSXClosingFragment };
var JSXElement = /** @class */ (function () {
    function JSXElement(openingElement, children, closingElement) {
        this.type = JSXSyntax.JSXElement;
        this.openingElement = openingElement;
        this.children = children;
        this.closingElement = closingElement;
    }
    return JSXElement;
}());
export { JSXElement };
var JSXEmptyExpression = /** @class */ (function () {
    function JSXEmptyExpression() {
        this.type = JSXSyntax.JSXEmptyExpression;
    }
    return JSXEmptyExpression;
}());
export { JSXEmptyExpression };
var JSXExpressionContainer = /** @class */ (function () {
    function JSXExpressionContainer(expression) {
        this.type = JSXSyntax.JSXExpressionContainer;
        this.expression = expression;
    }
    return JSXExpressionContainer;
}());
export { JSXExpressionContainer };
var JSXIdentifier = /** @class */ (function () {
    function JSXIdentifier(name) {
        this.type = JSXSyntax.JSXIdentifier;
        this.name = name;
    }
    return JSXIdentifier;
}());
export { JSXIdentifier };
var JSXMemberExpression = /** @class */ (function () {
    function JSXMemberExpression(object, property) {
        this.type = JSXSyntax.JSXMemberExpression;
        this.object = object;
        this.property = property;
    }
    return JSXMemberExpression;
}());
export { JSXMemberExpression };
var JSXAttribute = /** @class */ (function () {
    function JSXAttribute(name, value) {
        this.type = JSXSyntax.JSXAttribute;
        this.name = name;
        this.value = value;
    }
    return JSXAttribute;
}());
export { JSXAttribute };
var JSXNamespacedName = /** @class */ (function () {
    function JSXNamespacedName(namespace, name) {
        this.type = JSXSyntax.JSXNamespacedName;
        this.namespace = namespace;
        this.name = name;
    }
    return JSXNamespacedName;
}());
export { JSXNamespacedName };
var JSXOpeningElement = /** @class */ (function () {
    function JSXOpeningElement(name, selfClosing, attributes) {
        this.type = JSXSyntax.JSXOpeningElement;
        this.name = name;
        this.selfClosing = selfClosing;
        this.attributes = attributes;
    }
    return JSXOpeningElement;
}());
export { JSXOpeningElement };
var JSXOpeningFragment = /** @class */ (function () {
    function JSXOpeningFragment(selfClosing) {
        this.type = JSXSyntax.JSXOpeningFragment;
        this.selfClosing = selfClosing;
    }
    return JSXOpeningFragment;
}());
export { JSXOpeningFragment };
var JSXSpreadAttribute = /** @class */ (function () {
    function JSXSpreadAttribute(argument) {
        this.type = JSXSyntax.JSXSpreadAttribute;
        this.argument = argument;
    }
    return JSXSpreadAttribute;
}());
export { JSXSpreadAttribute };
var JSXText = /** @class */ (function () {
    function JSXText(value, raw) {
        this.type = JSXSyntax.JSXText;
        this.value = value;
        this.raw = raw;
    }
    return JSXText;
}());
export { JSXText };
