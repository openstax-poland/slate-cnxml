'use strict';

// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

var jsx$1 = /*#__PURE__*/Object.freeze({
    __proto__: null
});

// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
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
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
/** New-style JSX factory */
function jsxDEV(name, props) {
    return jsx(name, props);
}

exports.JSX = jsx$1;
exports.createElement = createElement;
exports.jsx = jsx;
exports.jsxDEV = jsxDEV;
exports.jsxs = jsxs;
