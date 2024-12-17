export const input = cnxml`
<table summary="">
    <tgroup cols="3">
        <tbody>
            <row>
                <entry>r1-1</entry>
                <entry morerows="1">r1-2</entry>
                <entry>r1-3</entry>
            </row>
            <row>
                <entry>r2-1</entry>
                <entry>r2-3</entry>
            </row>
        </tbody>
    </tgroup>
</table>
`

export const output = <document>
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
</document>
