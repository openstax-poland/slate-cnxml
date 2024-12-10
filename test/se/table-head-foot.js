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
            <thead
                columns={[
                    { name: null },
                    { name: null },
                    { name: "2" },
                ]}
                >
                <row>
                    <cell><p>h-s1</p></cell>
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
</>

export const output = cnxml`
<table>
    <tgroup cols="3">
        <colspec colnum="1" colname="1" />
        <colspec colnum="2" colname="2" />
        <colspec colnum="3" colname="3" />
        <spanspec spanname="s1" namest="2" nameend="3" />
        <thead>
            <colspec colnum="3" colname="2" />
            <row>
                <entry><para>h-s1</para></entry>
                <entry><para/></entry>
                <entry colname="2"><para>h-2</para></entry>
            </row>
        </thead>
        <tfoot>
            <row>
                <entry><para/></entry>
                <entry spanname="s1"><para>f-s1</para></entry>
            </row>
        </tfoot>
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
