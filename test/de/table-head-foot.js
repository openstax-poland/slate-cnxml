// This test check that cells in thead/tfoot can access tgroup's colspecs and
// spanspecs, but only if thead/tfoot doesn't define any themselves

export const input = cnxml`
<table>
    <tgroup cols="3">
        <colspec colnum="1" colname="1" />
        <colspec colnum="2" colname="2" />
        <colspec colnum="3" colname="3" />
        <spanspec spanname="s1" namest="2" nameend="3" />
        <thead>
            <colspec colnum="3" colname="2" />
            <row>
                <entry id="errid" spanname="s1">h-s1</entry>
                <entry colname="2">h-2</entry>
            </row>
        </thead>
        <tfoot>
            <row>
                <entry spanname="s1">f-s1</entry>
            </row>
        </tfoot>
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
            <thead
                columns={[
                    { name: null },
                    { name: null },
                    { name: "2" },
                ]}
                >
                <row>
                    <cell id="errid"><p>h-s1</p></cell>
                    <cell><p><text/></p></cell>
                    <cell column={{ column: "2" }}><p>h-2</p></cell>
                </row>
            </thead>
            <row>
                <cell column={{ start: "1", end: "2" }}><p>span</p></cell>
                <cell><p>r1-3</p></cell>
            </row>
            <row>
                <cell><p><text/></p></cell>
                <cell column={{ span: "s1" }}><p>s1</p></cell>
            </row>
            <tfoot>
                <row>
                    <cell><p><text/></p></cell>
                    <cell column={{ span: "s1" }}><p>f-s1</p></cell>
                </row>
            </tfoot>
        </tgroup>
    </table>
</document>

export const errors = [
    // <thead> declares its own <colspec>s, so #errid can't access span from
    // <tgroup>
    ['invalid-attribute', {
        namespace: 'http://cnx.rice.edu/cnxml',
        localName: 'entry',
        id: 'errid',
        attNamespace: null,
        attName: 'spanname',
        error: 'invalid-value',
        value: 's1',
        expected: [],
    }],
]
