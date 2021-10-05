'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Copyright 2021 OpenStax Poland

var jsx$1 = /*#__PURE__*/Object.freeze({
    __proto__: null
});

// Copyright 2021 OpenStax Poland
/** Old-style JSX factory */
function createElement(name, attrs, ...children) {
    const { xmlns, ...attributes } = attrs !== null && attrs !== void 0 ? attrs : {};
    return {
        name: { namespace: xmlns, local: name },
        attributes,
        children,
    };
}
/** New-style JSX factory */
function jsx(name, props) {
    const { xmlns, children, ...attributes } = props;
    return {
        name: { namespace: xmlns, local: name },
        attributes,
        children: children !== null && children !== void 0 ? children : [],
    };
}
const jsxs = jsx;

exports.JSX = jsx$1;
exports.createElement = createElement;
exports.jsx = jsx;
exports.jsxs = jsxs;
