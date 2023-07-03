export default global.cnxml = function cnxml(fragments) {
    if (fragments.length > 1) {
        throw new Error('cnxml`` does not support interpolation')
    }

    return `<document xmlns="http://cnx.rice.edu/cnxml" xmlns:editing="http://adaptarr.naukosfera.com/editing/1.0" xml:lang="en" cnxml-version="0.7" id="test" module-id="test">
        <title>Test</title>
        <content>
            ${fragments[0]}
        </content>
    </document>`
}
