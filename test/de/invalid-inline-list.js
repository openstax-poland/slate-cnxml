/** @jsx h */
/** @jsxFrag 'fragment' */

export const input = cnxml`
<section>
    <title>Section</title>
    <exercise>
        <problem>
            <para>Text
                <list>
                    <item>Item</item>
                </list>
            </para>
        </problem>
    </exercise>
</section>
`

export const output = <document>
    <section>
        <title>Section</title>
        <exercise>
            <exproblem>
                <p>Text</p>
                <itemlist>
                    <li>
                        <p>Item</p>
                    </li>
                </itemlist>
            </exproblem>
        </exercise>
    </section>
</document>

export const errors = [
    ['unexpected-element', { id: null, localName: 'list', namespace: 'http://cnx.rice.edu/cnxml' }],
]
