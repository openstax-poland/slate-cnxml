/** @jsxRuntime classic @jsx h */

import { Text } from 'slate'

import { jsx, Node as RenderNode } from '../../src'

export const input = [
    {
        type: 'paragraph',
        children: [
            { text: 'Plain custom', custom: true },
            { text: ' and ' },
            { text: 'styled custom', strong: true, custom: true },
        ],
    },
]

export const output = cnxml`
<para xmlns:t="urn:test">
    <t:custom>Plain custom</t:custom> and <t:custom><emphasis effect="bold">styled custom</emphasis></t:custom>
</para>
`

export function serializeText(
    text: Text & { custom?: true },
    attrs: Record<string, unknown>,
    children: RenderNode,
) {
    if (!text.custom) return null

    return jsx('custom' as any, {
        ...attrs,
        xmlns: 'urn:test',
        children,
    })
}
