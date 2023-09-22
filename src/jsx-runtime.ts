// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import * as JSX from './jsx'
import { Element, Node } from './render'

export * as JSX from './jsx'

/** Old-style JSX factory */
export function createElement<
    K extends keyof JSX.IntrinsicElements,
    A extends JSX.IntrinsicAttributes,
>(
    name: K,
    attrs: A | null,
    ...children: Node[]
): Element {
    const { xmlns, ...attributes } = attrs ?? {}

    return {
        name: { namespace: xmlns, local: name },
        attributes,
        children,
    }
}

/** New-style JSX factory */
export function jsx<
    K extends keyof JSX.IntrinsicElements,
    A extends JSX.IntrinsicAttributes,
>(name: K, props: A): Element {
    const { xmlns, children, ...attributes } = props

    return {
        name: { namespace: xmlns, local: name },
        attributes,
        children: children ?? [],
    }
}

export const jsxs = jsx
