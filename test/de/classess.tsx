/** @jsxRuntime classic @jsx h */

export const input = cnxml`
<note id="n1" class="a b c">
    <para>test</para>
</note>
`

export const output = <document>
    <note id="n1" classes={['a', 'b', 'c']}>
        <p>test</p>
    </note>
</document>
