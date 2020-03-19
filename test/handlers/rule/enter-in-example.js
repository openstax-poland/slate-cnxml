/** @jsx h */

import { Editor, Element, Transforms } from 'slate'

export default (input, editor) => {
    input.break().break()
    Transforms.select(editor, Editor.end(editor, Editor.above(editor, { match: Element.isElement })[1]))
    input.break().break().break()
}

export const input = <editor>
    <rule type="rule">
        <statement>
            <p>Statement</p>
        </statement>
        <ruleexample>
            <p>Ex<cursor/>ample</p>
        </ruleexample>
    </rule>
</editor>

export const output = <editor>
    <rule type="rule">
        <statement>
            <p>Statement</p>
        </statement>
        <ruleexample>
            <p>Ex</p>
        </ruleexample>
        <ruleexample>
            <p>ample</p>
        </ruleexample>
    </rule>
    <p><cursor/></p>
</editor>
