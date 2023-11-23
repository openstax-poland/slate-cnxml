export const input = cnxml`
<para>
    <term>before <term><emphasis>note next two spaces: </emphasis></term>after </term>
</para>
`

export const output = <document>
    <p>
        <text/>
        <term>
            <text>before </text>
            <term>
                <b>note next two spaces:</b>
            </term>
            <text> after</text>
        </term>
        <text/>
    </p>
</document>
