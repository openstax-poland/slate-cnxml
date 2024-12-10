export const input = <>
    <table>
        <tgroup
            columns={[
                { name: "1" },
                { name: "2" },
                { name: "3" },
            ]}
            >
            <row>
                <cell><p>x</p></cell>
                <cell><p><text/></p></cell>
                <cell><p><text/></p></cell>
            </row>
            <row>
                <cell><p><text/></p></cell>
                <cell><p>y</p></cell>
                <cell><p><text/></p></cell>
            </row>
            <row>
                <cell><p><text/></p></cell>
                <cell><p><text/></p></cell>
                <cell><p>z</p></cell>
            </row>
        </tgroup>
    </table>
</>

export const output = cnxml`
<table>
    <tgroup cols="3">
        <colspec colnum="1" colname="1" />
        <colspec colnum="2" colname="2" />
        <colspec colnum="3" colname="3" />
        <tbody>
            <row>
                <entry colname="1"><para>x</para></entry>
            </row>
            <row>
                <entry colname="2"><para>y</para></entry>
            </row>
            <row>
                <entry colname="3"><para>z</para></entry>
            </row>
        </tbody>
    </tgroup>
</table>
`
