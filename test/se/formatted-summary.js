import { jsx } from '../../src'

export const input = <>
    <table id="t1">
        <tgroup columns={[{ column: null }]}>
            <row>
                <cell><p>Table 1</p></cell>
            </row>
        </tgroup>
        <tablesummary><b>Strong</b> summary</tablesummary>
    </table>
    <table id="t2">
        <tgroup columns={[{ column: null }]}>
            <row>
                <cell><p>Table 2</p></cell>
            </row>
        </tgroup>
        <tablesummary>Summary<text suggestion="insert"> with suggestions</text></tablesummary>
    </table>
</>

export const output = cnxml`
<table id="t1">
    <tgroup cols="1">
        <tbody>
            <row>
                <entry><para>Table 1</para></entry>
            </row>
        </tbody>
    </tgroup>
    <editing:summary><emphasis effect="bold">Strong</emphasis> summary</editing:summary>
</table>
<table id="t2">
    <tgroup cols="1">
        <tbody>
            <row>
                <entry><para>Table 2</para></entry>
            </row>
        </tbody>
    </tgroup>
    <editing:summary>Summary<editing:insert> with suggestions</editing:insert></editing:summary>
</table>
`

export function serializeText(text, attrs, children) {
    if (!text.suggestion) return null

    return jsx(text.suggestion, {
        ...attrs,
        xmlns: "http://adaptarr.naukosfera.com/editing/1.0",
        children,
    })
}
