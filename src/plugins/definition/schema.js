// Copyright 2019 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import { Text, Block } from 'slate'

function normalizeDefinition(change, error) {
    const { code, key, index, node, child } = error

    switch (code) {
    case 'first_child_type_invalid':
        // Insert missing definition_term
        const term = Block.create({
            type: 'definition_term',
            nodes: [Text.create()],
        })
        change.insertNodeByKey(node.key, 0, term)
        break

    case 'child_max_invalid':
        // When user press Backspace in front of def_term it will jump into
        // definition which is before of this.
        if (child.type === 'definition_term') {
            change.setNodeByKey(child.key, 'paragraph')
        }
        break

    case 'child_type_invalid':
        if (child.type === 'definition_example') {
            // Move examples into corresponding meanings.
            const prev = node.nodes.get(index - 1)
            if (prev.type === 'definition_meaning') {
                change.moveNodeByKey(child.key, prev.key, prev.nodes.size)
                break
            }
            // Add empty meaning with given example.
            const para = Block.create('paragraph')
            const meaning = Block.create({
                type: 'definition_meaning',
                nodes: [para],
            })
            change.withoutNormalizing(() => {
                change.insertNodeByKey(node.key, index, meaning)
                change.moveNodeByKey(child.key, meaning.key, 1)
            })
            break
        }

        change.wrapNodeByKey(child.key, Block.create('definition_meaning'))
        break

    case 'child_min_invalid':
        if (!node.nodes.some(n => n.type && n.type === 'definition_meaning')) {
            // Insert missing meaning.
            const para = Block.create('paragraph')
            change.insertNodeByKey(node.key, 1, Block.create({
                type: 'definition_meaning',
                nodes: [para],
            }))
            break
        }

        console.log('Unhandled definition child_min_invalid:', child)
        break

    case 'child_unknown':
        // An invalid node following the See Also should be folded into the
        // See Also.
        if (index > 0) {
            const nodeBefore = node.nodes.get(index - 1)
            if (nodeBefore && nodeBefore.type === 'definition_seealso') {
                change.moveNodeByKey(child.key, nodeBefore.key, nodeBefore.nodes.size)
                break
            }
        }

        // Unwrap any other nodes
        change.unwrapBlockByKey(child.key)
        break

    default:
        console.warn('Unhandled definition violation:', code)
        break
    }
}

function normalizeTerm(change, error) {
    const { code, key, node, child } = error

    switch (code) {
    default:
        console.warn('Unhandled definition_term violation:', code)
        break
    }
}

function normalizeMeaning(change, error) {
    const { code, key, node, child } = error

    switch (code) {
    case 'child_type_invalid':
        change.unwrapNodeByKey(child.key)
        break

    case 'child_unknown':
        change.unwrapBlockByKey(child.key)
        break

    case 'parent_type_invalid':
        // Unwrap content.
        const path = change.value.document.getPath(node.key)
        change.unwrapChildrenByPath(path)
        break

    default:
        console.warn('Unhandled definition_meaning violation:', code)
        break
    }
}

function normalizeExample(change, error) {
    const { code, key, node, child } = error

    switch (code) {
    case 'child_type_invalid':
        console.warn('Unhandled definition_example child_type_invalid:', child)
        break

    case 'parent_type_invalid':
        // Unwrap content.
        const path = change.value.document.getPath(node.key)
        change.unwrapChildrenByPath(path)
        break

    default:
        console.warn('Unhandled definition_example violation:', code)
        break
    }
}

function normalizeSeeAlso(change, error) {
    const { code, key, node, child } = error

    switch (code) {
    case 'child_type_invalid':
        if (child.type === 'paragraph') {
            change.setNodeByKey(child.key, { type: 'definition_term' })
            break
        }

        console.warn('Unhandled definition_seealso child_type_invalid:', child)
        break

    case 'parent_type_invalid':
        // Unwrap content.
        const path = change.value.document.getPath(node.key)
        change.unwrapChildrenByPath(path)
        break

    default:
        console.warn('Unhandled definition_seealso violation:', code, JSON.stringify(child))
        break
    }
}

export default function schema({ content }) {
    const content_types = content.map(type => ({ type }))

    return {
        blocks: {
            definition: {
                nodes: [
                    { match: { type: 'definition_term' }, min: 1, max: 1 },
                    { match: { type: 'definition_meaning' }, min: 1 },
                    { match: { type: 'definition_seealso' }, min: 0, max: 1 },
                ],
                first: { type: 'definition_term' },
                normalize: normalizeDefinition,
            },
            definition_term: {
                parent: [
                    { match: { type: 'definition' } },
                    { match: { type: 'definition_seealso' } },
                ],
                normalize: normalizeTerm,
            },
            definition_meaning: {
                nodes: [
                    { match: content_types, min: 1 },
                    { match: { type: 'definition_example' }, min: 0 },
                ],
                parent: { type: 'definition' },
                normalize: normalizeMeaning,
            },
            definition_example: {
                nodes: [ { match: content_types, min: 1 } ],
                normalize: normalizeExample,
            },
            definition_seealso: {
                nodes: [ { match: { type: 'definition_term' }, min: 1 } ],
                parent: { type: 'definition' },
                normalize: normalizeSeeAlso,
            }
        },
    }
}