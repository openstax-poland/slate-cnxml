export const input = cnxml`
<table>
    <tgroup cols="3">
        <colspec colnum="1" colname="1" />
        <colspec colnum="2" colname="2" />
        <colspec colnum="3" colname="3" />
        <tbody>
            <row>
                <entry colname="1">x</entry>
            </row>
            <row>
                <entry colname="2">y</entry>
            </row>
            <row>
                <entry colname="3">z</entry>
            </row>
        </tbody>
    </tgroup>
</table>
`

export const output = <document>
    <table>
        <tgroup
            columns={[
                { name: "1" },
                { name: "2" },
                { name: "3" },
            ]}
            >
            <row>
                <cell column={{ column: "1" }}><p>x</p></cell>
                <cell><p><text/></p></cell>
                <cell><p><text/></p></cell>
            </row>
            <row>
                <cell><p><text/></p></cell>
                <cell column={{ column: "2" }}><p>y</p></cell>
                <cell><p><text/></p></cell>
            </row>
            <row>
                <cell><p><text/></p></cell>
                <cell><p><text/></p></cell>
                <cell column={{ column: "3" }}><p>z</p></cell>
            </row>
        </tgroup>
    </table>
</document>
