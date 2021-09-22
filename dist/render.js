// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
import { isPlainObject } from 'is-plain-object';
import { CMLNLE_NAMESPACE, CNXML_NAMESPACE, CXLXT_NAMESPACE, EDITING_NAMESPACE, XML_NAMESPACE, XMLNS_NAMESPACE, } from './consts';
export const Node = {
    isElement(node) {
        return isPlainObject(node) && typeof node.name === 'object';
    },
    isProcessingInstruction(node) {
        return node != null && typeof node.target === 'string';
    },
};
/** Mapping from XML prefixes to namespace URIs */
const NAMESPACE_PREFIXES = {
    xml: XML_NAMESPACE,
    cmlnle: CMLNLE_NAMESPACE,
    cxlxt: CXLXT_NAMESPACE,
    editing: EDITING_NAMESPACE,
};
/** Render a JSX element into an XML document */
export function render(root) {
    const namespace = root.name.namespace;
    const doc = document.implementation.createDocument(namespace !== null && namespace !== void 0 ? namespace : null, root.name.local, null);
    const renderer = { namespace: namespace !== null && namespace !== void 0 ? namespace : null, doc, depth: 0 };
    for (const [prefix, uri] of Object.entries(NAMESPACE_PREFIXES)) {
        if (uri === XML_NAMESPACE)
            continue;
        doc.documentElement.setAttributeNS(XMLNS_NAMESPACE, `xmlns:${prefix}`, uri);
    }
    finishElement(renderer, root, doc.documentElement);
    return doc;
}
/** Render a JSX element into an XML element */
function renderElement(renderer, element) {
    var _a;
    const ns = (_a = element.name.namespace) !== null && _a !== void 0 ? _a : renderer.namespace;
    const el = renderer.doc.createElementNS(ns, element.name.local);
    finishElement(renderer, element, el);
    return el;
}
/** CNXML tags which contain only block and can be safely formatted */
/* eslint-disable array-element-newline */
const BLOCK_TAGS = [
    'commentary', 'content', 'definition', 'document', 'example', 'exercise',
    'figure', 'glossary', 'item', 'list', 'meaning', 'media', 'note', 'problem',
    'proof', 'quote', 'rule', 'section', 'seealso', 'solution', 'statement',
    'subfigure',
];
/* eslint-enable array-element-newline */
/**
 * Attributes added for ex. when transforming from JSX to HTML.
 * We want to omit them.
 */
const RESERVED_ATTRIBUTES = [
    '__self',
    '__source', // Location of JSX expression in the source
];
/** Finish rendering an already created element */
function finishElement(renderer, element, out) {
    var _a;
    for (const [key, value] of Object.entries(element.attributes)) {
        if (RESERVED_ATTRIBUTES.includes(key))
            continue;
        if (value == null)
            continue;
        let val;
        switch (typeof value) {
            case 'string':
                val = value;
                break;
            case 'object':
            case 'boolean':
            case 'number':
            case 'bigint':
                val = value.toString();
                break;
            default:
                continue;
        }
        const r = key.match(/([a-z]+)([A-Z][a-z]*)/);
        if (r) {
            const [, prefix, attr] = r;
            const ns = NAMESPACE_PREFIXES[prefix];
            if (ns == null) {
                throw new Error(`unknown namespace prefix ${prefix} for attribute ${key}`);
            }
            out.setAttributeNS(ns, attr.toLowerCase(), val.toString());
        }
        else {
            out.setAttribute(key, val.toString());
        }
    }
    const depth = renderer.depth + 1;
    const indent = out.namespaceURI === CNXML_NAMESPACE && BLOCK_TAGS.includes(out.tagName)
        ? '\n' + '  '.repeat(depth)
        : null;
    const r = {
        ...renderer,
        depth,
        namespace: (_a = element.name.namespace) !== null && _a !== void 0 ? _a : renderer.namespace,
    };
    let count = 0;
    function renderChild(child) {
        if (child == null)
            return;
        if (Array.isArray(child)) {
            for (const node of child) {
                renderChild(node);
            }
            return;
        }
        if (indent != null) {
            out.append(indent);
        }
        if (child instanceof globalThis.Node) {
            out.append(renderer.doc.importNode(child, true));
        }
        else if (typeof child === 'string') {
            out.append(child);
        }
        else if (Node.isProcessingInstruction(child)) {
            out.append(document.createProcessingInstruction(child.target, child.value));
        }
        else {
            out.append(renderElement(r, child));
        }
        count += 1;
    }
    renderChild(element.children);
    if (count > 0 && indent != null) {
        out.append('\n' + '  '.repeat(renderer.depth));
    }
}
