/** @jsxRuntime classic @jsx h */

export const input = <>
    <p>
        {"This example contains "}
        <b>
            {"marks nested "}
            <i>
                {"inside marks, and containing "}
                <term>inlines</term>
            </i>
        </b>
    </p>
</>

export const output = cnxml`
<para>This example contains \
<emphasis effect="bold">marks nested \
<emphasis effect="italics">inside marks, and containing </emphasis></emphasis>\
<term><emphasis effect="bold"><emphasis effect="italics">inlines</emphasis></emphasis></term>
</para>
`
