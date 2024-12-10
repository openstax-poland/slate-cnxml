export const input = cnxml`
<table>
    <tgroup cols="3">
        <thead>
            <row>
                <entry>h1</entry>
                <entry>h2</entry>
                <entry>h3</entry>
            </row>
        </thead>
        <tfoot>
            <row>
                <entry>f1</entry>
                <entry>f2</entry>
                <entry>f3</entry>
            </row>
        </tfoot>
        <tbody>
            <row>
                <entry>r1-1</entry>
                <entry>r1-2</entry>
                <entry>r1-3</entry>
            </row>
            <row>
                <entry>r2-1</entry>
                <entry>r2-2</entry>
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
            spans={[]}
            >
            <thead>
                <row>
                    <cell><p>h1</p></cell>
                    <cell><p>h2</p></cell>
                    <cell><p>h3</p></cell>
                </row>
            </thead>
            <row>
                <cell><p>r1-1</p></cell>
                <cell><p>r1-2</p></cell>
                <cell><p>r1-3</p></cell>
            </row>
            <row>
                <cell><p>r2-1</p></cell>
                <cell><p>r2-2</p></cell>
                <cell><p>r2-3</p></cell>
            </row>
            <tfoot>
                <row>
                    <cell><p>f1</p></cell>
                    <cell><p>f2</p></cell>
                    <cell><p>f3</p></cell>
                </row>
            </tfoot>
        </tgroup>
    </table>
</document>
