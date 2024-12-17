export const input = <>
    <table>
        <tgroup
            columns={[
                { name: null },
                { name: null },
                { name: null },
            ]}
            >
            <row>
                <cell><p>r1-1</p></cell>
                <cell rows={2}><p>r1-2</p></cell>
                <cell><p>r1-3</p></cell>
            </row>
            <row>
                <cell><p>r2-1</p></cell>
                <cell><p>r2-3</p></cell>
            </row>
        </tgroup>
    </table>
</>

export const output = cnxml`
<table summary="">
    <tgroup cols="3">
        <tbody>
            <row>
                <entry><para>r1-1</para></entry>
                <entry morerows="1"><para>r1-2</para></entry>
                <entry><para>r1-3</para></entry>
            </row>
            <row>
                <entry><para/></entry>
                <entry spanname="s1"><para>s1</para></entry>
            </row>
        </tbody>
    </tgroup>
</table>
`
