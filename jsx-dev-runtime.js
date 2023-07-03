'use strict';

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

// Copyright 2022 OpenStax Poland
/** New-style JSX factory */
function jsxDEV(name, props, key, isStaticChildren, source, self) {
    return jsx(name, props);
}

exports.JSX = jsx$1;
exports.createElement = createElement;
exports.jsx = jsx;
exports.jsxDEV = jsxDEV;
exports.jsxs = jsxs;
