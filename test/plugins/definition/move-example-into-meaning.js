/** @jsx h */

export default change => change.normalize()

export const input = <value>
    <document>
        <definition>
            <defterm>Term</defterm>
            <defmeaning>
                <p>Meaning</p>
            </defmeaning>
            <defexample>
                <p>Example</p>
            </defexample>
            <defmeaning>
                <p>Meaning 2</p>
            </defmeaning>
        </definition>
    </document>
</value>

export const output = <value>
    <document>
        <definition>
            <defterm>Term</defterm>
            <defmeaning>
                <p>Meaning</p>
                <defexample>
                    <p>Example</p>
                </defexample>
            </defmeaning>
            <defmeaning>
                <p>Meaning 2</p>
            </defmeaning>
        </definition>
    </document>
</value>
