// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

var jsx$1 = /*#__PURE__*/Object.freeze({
    __proto__: null
});

// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
/**
 * Old-style JSX factory
 *
 * @deprecated
 */
function createElement(name, attrs, ...children) {
    const { xmlns, ...attributes } = attrs ?? {};
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
        children: children ?? [],
    };
}
const jsxs = jsx;

export { jsx$1 as JSX, createElement, jsx, jsxs };
//# sourceMappingURL=jsx-runtime.js.map
