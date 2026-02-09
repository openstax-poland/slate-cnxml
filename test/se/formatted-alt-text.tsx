/** @jsxRuntime classic @jsx h */
/* eslint-disable @stylistic/max-len */

import { Text } from 'slate'

import { jsx, Node as RenderNode } from '../../src'

export const input = <>
    <figure id="f1">
        <media>
            <img src="f1.png" intendedUse="all"><text/></img>
            <mediaalt><b>Strong</b> alt text</mediaalt>
        </media>
        <caption>Figure 1 caption</caption>
    </figure>
    <figure id="f2">
        <media>
            <img src="f2.png" intendedUse="all"><text/></img>
            <mediaalt>Alt text<text suggestion="insert"> with suggestions</text></mediaalt>
        </media>
        <caption>Figure 2 caption</caption>
    </figure>
</>

export const output = cnxml`
<figure id="f1">
    <media>
        <image src="f1.png" mime-type="image/png"/>
        <editing:alt-text><emphasis effect="bold">Strong</emphasis> alt text</editing:alt-text>
    </media>
    <caption>Figure 1 caption</caption>
</figure>
<figure id="f2">
    <media>
        <image src="f2.png" mime-type="image/png"/>
        <editing:alt-text>Alt text<editing:insert> with suggestions</editing:insert></editing:alt-text>
    </media>
    <caption>Figure 2 caption</caption>
</figure>
`

export function serializeText(
    text: Text & { suggestion?: string },
    attrs: Record<string, unknown>,
    children: RenderNode,
): RenderNode {
    if (!text.suggestion) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jsx(text.suggestion as any, {
        ...attrs,
        xmlns: "http://adaptarr.naukosfera.com/editing/1.0",
        children,
    })
}
