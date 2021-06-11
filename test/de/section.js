/** @jsx h */

export const input = cnxml`
<section id="s3">
    <title>One more section</title>
    <exercise>
        <problem>
            <para>Only sections can follow sections
                <list>
                    <item>item</item>
                </list>
            </para>
        </problem>
    </exercise>
</section>
`

export const output = <document>
    <section id="s3">
        <title>One more section</title>
        <exercise>
            <exproblem>
                <p>Only sections can follow sections </p>
                <itemlist>
                    <li><p>item</p></li>
                </itemlist>
                <p><text/></p>
            </exproblem>
        </exercise>
    </section>
</document>

export const errors = [
    [
      "unexpected-element",
      {
        "id": null,
        "localName": "list",
        "namespace": "http://cnx.rice.edu/cnxml",
      }
    ]
]
