export const input = cnxml`
<para>
    <term>first</term><term>second</term>
</para>
`

export const output = <document>
    <p>
        <text/>
        <term>first</term>
        <text/>
        <term>second</term>
        <text/>
    </p>
</document>
