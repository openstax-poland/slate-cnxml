/** @jsx h */

export default input => input.backspace()

export const input = <editor>
    <p>Before</p>
    <rule type="rule">
        <statement>
            <p><cursor/>Statement</p>
        </statement>
        <proof>
            <p>Proof</p>
        </proof>
    </rule>
    <p>After</p>
</editor>

export const output = <editor>
    <p>Before<cursor/>Statement</p>
    <rule type="rule">
        <statement>
            <p><text/></p>
        </statement>
        <proof>
            <p>Proof</p>
        </proof>
    </rule>
    <p>After</p>
</editor>

