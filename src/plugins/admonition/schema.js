// Copyright 2018 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

// Admonition types supported by both CNXML's <note> and HTMLBook. Missing are
// `aside` from CNXML and `caution` from HTMLBook.
const TYPES = ["note", "warning", "tip", "important"]

function normalizeAdmonition(change, error) {
    const { code, node, child } = error

    switch (code) {
    // Admonition type is not valid.
    case 'node_data_invalid':
        // By default slate removes all nodes that failed validation, but we
        // only want the admonition gone, not its contents.
        change.unwrapBlockByKey(node.key)
        break

    case 'child_max_invalid':
        if (child.type === 'title') {
            change.mergeNodeByKey(child.key)
            return
        }
        console.warn('Unhandled admonition violation:', code)
        break

    default:
        console.warn('Unhandled admonition violation:', code)
        break
    }
}

const CONTENT = [
    { type: 'paragraph' },
    { type: 'table' },
]

export default {
    blocks: {
        admonition: {
            data: {
                type: v => TYPES.includes(v),
            },
            nodes: [
                { match: { type: 'title' }, min: 0, max: 1 },
                { match: CONTENT },
            ],
            normalize: normalizeAdmonition,
        }
    }
}
