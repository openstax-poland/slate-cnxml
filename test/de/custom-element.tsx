/** @jsxRuntime classic @jsx h */

import { Path } from 'slate'

import * as CNXML from '../../src'

export const input = cnxml`
<t:custom xmlns:t="urn:test" attr="12">Custom <emphasis effect="bold">node</emphasis></t:custom>
`

export const output = <document>
    <element type="custom" attr={12}>Custom <b>node</b></element>
</document>

export function withEditor(editor: CNXML.DeserializingEditor) {
    const { deserializeElement } = editor

    editor.deserializeElement = (el: Element, at: Path, ctx: CNXML.Deserializers) => {
        if (el.namespaceURI === 'urn:test' && el.localName === 'custom') {
            CNXML.buildElement<any>(editor, el, at, {
                type: 'custom',
                attr: Number(el.getAttribute('attr')),
                children: [],
            }, CNXML.INLINE)
            CNXML.normalizeLine(editor, at)
            return
        }

        return deserializeElement(el, at, ctx)
    }

    return editor
}
