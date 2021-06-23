// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
import * as JSX_1 from './jsx';
export { JSX_1 as JSX };
/** Old-style JSX factory */
export function createElement(name, attrs, ...children) {
    const { xmlns, ...attributes } = attrs !== null && attrs !== void 0 ? attrs : {};
    return {
        name: { namespace: xmlns, local: name },
        attributes,
        children,
    };
}
/** New-style JSX factory */
export function jsx(name, props) {
    const { xmlns, children, ...attributes } = props;
    return {
        name: { namespace: xmlns, local: name },
        attributes,
        children: children !== null && children !== void 0 ? children : [],
    };
}
export const jsxs = jsx;
