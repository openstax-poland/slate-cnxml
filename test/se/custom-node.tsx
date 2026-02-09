/** @jsxRuntime classic @jsx h */

import { Element } from 'slate'

import { jsx, Node as RenderNode } from '../../src'

export const input = [
    {
        type: 'custom',
        attr: 12,
        children: [
            { text: 'Custom ' },
            { text: 'node', strong: true },
        ],
    },
]

export const output = cnxml`
<t:custom xmlns:t="urn:test" attr="12">Custom <emphasis effect="bold">node</emphasis></t:custom>
`

export function serializeElement(
    node: Element | { type: 'custom', attr: number },
    attrs: Record<string, unknown>,
    children: RenderNode,
): RenderNode {
    if (node.type !== 'custom') {
        return null
    }

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    return jsx('custom' as any, {
        ...attrs,
        xmlns: 'urn:test',
        attr: node.attr,
        children,
    })
}
