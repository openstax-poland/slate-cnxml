export const input = <>
    <table>
        <tgroup
            columns={[
                { name: "1" },
                { name: "2" },
                { name: "3" },
            ]}
            spans={[
                { name: "s1", start: "2", end: "3" },
            ]}
            >
            <row>
                <cell column={{ start: "1", end: "2" }}><p>span</p></cell>
                <cell><p>r1-3</p></cell>
            </row>
            <row>
                <cell><p><text/></p></cell>
                <cell column={{ span: "s1" }}><p>s1</p></cell>
            </row>
        </tgroup>
    </table>
</>

export const output = cnxml`
<table summary="">
    <tgroup cols="3">
        <colspec colnum="1" colname="1" />
        <colspec colnum="2" colname="2" />
        <colspec colnum="3" colname="3" />
        <spanspec spanname="s1" namest="2" nameend="3" />
        <tbody>
            <row>
                <entry namest="1" nameend="2"><para>span</para></entry>
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
