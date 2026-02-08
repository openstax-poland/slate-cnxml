/** @jsxRuntime classic @jsx h */

export const input = <>
    <note id="n1" classes={['a', 'b', 'c']}>
        <p>test</p>
    </note>
</>

export const output = cnxml`
<note id="n1" type="note" class="a b c">
    <para>test</para>
</note>
`
