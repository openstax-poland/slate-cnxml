export const input = cnxml`
<table>
    <tgroup cols="3">
        <colspec colnum="1" colname="1" />
        <colspec colnum="2" colname="2" />
        <colspec colnum="3" colname="3" />
        <spanspec spanname="s1" namest="2" nameend="3" />
        <tbody>
            <row>
                <entry namest="1" nameend="2">span</entry>
                <entry>r1-3</entry>
            </row>
            <row>
                <entry spanname="s1">s1</entry>
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
</document>
