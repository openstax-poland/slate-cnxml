// Copyright 2022 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import * as JSX from './jsx'
import { Element } from './render'
import { jsx } from './jsx-runtime'

export * from './jsx-runtime'

/** New-style JSX factory */
export function jsxDEV<
    K extends keyof JSX.IntrinsicElements,
    A extends JSX.IntrinsicAttributes,
>(
    name: K,
    props: A,
): Element {
    return jsx(name, props)
}
