// Copyright 2019 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

function normalizeTerm(change, error) {
    const { code, child } = error

    switch (code) {
    case 'child_object_invalid':
        const text = child.getText()
        change.removeNodeByKey(child.key)
        change.insertText(text)
        break

    default:
        console.warn('Unhandled term violation:', code)
        break
    }
}

export default {
    inlines: {
        term: {
            nodes: [{
                match: { object: 'text' },
            }],
            marks: [
                { type: 'strong' },
                { type: 'emphasis' },
                { type: 'underline' },
                { type: 'superscript' },
                { type: 'subscript' },
            ],
            data: {
                reference: ref => ref == null || typeof ref === 'string'
            },
            text: s => s.length,
            normalize: normalizeTerm,
        },
    },
}