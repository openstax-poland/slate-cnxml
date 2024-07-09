'use strict';

var Slate = require('slate');
var cnxDesigner = require('cnx-designer');
var isPlainObject = require('is-plain-object');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var Slate__namespace = /*#__PURE__*/_interopNamespaceDefault(Slate);

// Copyright 2020 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
const r = new Uint8Array(16);
function s(start, end) {
    return Array.from(r.subarray(start, end), x => x.toString(16).padStart(2, '0')).join('');
}
function v4() {
    window.crypto.getRandomValues(r);
    r[6] = 0x40 | (r[6] & 0x0f);
    r[8] = 0x40 | (r[8] & 0x3f);
    return `${s(0, 4)}-${s(4, 6)}-${s(6, 8)}-${s(8, 10)}-${s(10, 16)}`;
}

// Copyright 2020 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
/** Yield items of an iterable together with their indices */
function* enumerate(iter, reverse) {
    if (reverse) {
        if (Array.isArray(iter)) {
            for (let index = iter.length - 1; index >= 0; --index) {
                yield [index, iter[index]];
            }
        }
        else {
            yield* enumerate(Array.from(iter), true);
        }
        return;
    }
    let index = 0;
    for (const value of iter) {
        yield [index++, value];
    }
}

// Copyright 2020 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
const KNOWN_TEXT_PROPS = ['text', 'emphasis', 'strong', 'position'];
/** Check if a node contains only plain, unmarked text */
function isPlainText$1(node) {
    if (Slate.Element.isElement(node)) {
        return node.children.every(isPlainText$1);
    }
    if (!Object.keys(node).every(key => KNOWN_TEXT_PROPS.includes(key))) {
        return false;
    }
    const text = node;
    return !text.emphasis
        && !text.strong
        && (text.position == null || text.position === 'normal');
}

// Copyright 2020 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
/**
 * Normalize white space in a node.
 *
 * White space codepoints in Unicode can be roughly divided into four categories
 * spacing marks, non-breaking spacing marks, zero-width marks, and line breaks.
 *
 * Spacing marks are codepoints used (usually) to separate words. As of Unicode
 * 12.1 those are: U+0009 CHARACTER TABULATION, U+0020 SPACE, U+1680 OGHAM SPACE
 * MARK, U+2000 EN QUAD, U+2001 EM QUAD, U+2002 EN SPACE, U+2003 EM SPACE,
 * U+2004 THREE-PER-EM SPACE, U+2005 FOUR-PER-EM SPACE, U+2006 SIX-PER-EM SPACE,
 * U+2008 PUNCTUATION SPACE, U+2009 THIN SPACE, U+200A HAIR SAPCE, U+205F MEDIUM
 * MATHEMATICAL SPACE, and U+3000 IDEOGRAPHIC SPACE.
 *
 * Non-breaking spacing marks are spacing marks which prevent line breaks from
 * being inserted. As of Unicode 12.1 those are: U+00A0 NO-BREAK SPACE,
 * U+2007 FIGURE SPACE, and U+202F NARROW NO-BREAK SPACE.
 *
 * Zero-width marks are codepoints which themselves do not impact spacing
 * between words (hence zero-width), but affect spacing and rendering in other
 * ways. As of Unicode 12.1 those are: U+180E MONGOLIAN VOWEL SEPARATOR,
 * U+200B ZERO WIDTH SPACE, U+200C ZERO WIDTH NON-JOINER, U+200D ZERO WIDTH
 * JOINER, U+2060 WORD JOINER, and U+FEFF ZERO WIDTH NON-BREAKING SPACE.
 *
 * Line breaks are codepoints which introduce a line break. As of Unicode 12.1
 * those are: U+000A LINE FEED, U+000B LINE TABULATION, U+000C FORM FEED,
 * U+000D CARRAGE RETURN, U+0085 NEXT LINE, U+2028 LINE SEPARATOR, and
 * U+2029 PARAGRAPH SEPARATOR.
 *
 * White space normalization is done in steps:
 *
 * 1.  First all spacing marks and line breaks are changed into U+0020 SPACE,
 *     all non-breaking spacing marks into U+00A0 NO-BREAK SPACE, and U+FEFF
 *     ZERO WIDTH NON-BREAKING SPACE into U+2060 WORD JOINER. The exception to
 *     this are U+1680 OGHAM SPACE MARK and U+3000 IDEOGRAPHIC SPACE which are
 *     left unchanged.
 *
 * 2.  Next, all zero-width marks neighbouring a spacing mark are removed.
 *
 * 3.  Next, sequences consisting of a single white space codepoint are
 *     collapsed into a single codepoint.
 *
 * 4.  Next, all spacing marks neighbouring U+1680 OGHAM SPACE MARK or
 *     U+3000 IDEOGRAPHIC SPACE are removed.
 *
 * 5.  Next, all spacing marks neighbouring a non-breaking spacing mark are
 *     removed.
 *
 * 6.  Next, if there still are sequences of white spaces, only their first code
 *     point is retained.
 *
 * 7.  Finally, white space is stripped from beginning and end of nodes, and
 *     end points of marks and inlines are adjusted so that they don't begin or
 *     end with white spaces.
 *
 * Note that this is a conceptual description, and the actual implementation may
 * differ slightly (for example it performs step 7 first).
 */
function normalizeWhiteSpace(editor, at) {
    const node = Slate.Node.get(editor, at);
    const ends = Slate.Editor.isInline(editor, node) ? 'unwrap' : 'trim';
    normalizeTextBoundaries(editor, { at, ends });
    normalizeSpaces(editor, at);
}
/**
 * Adjust marks and inlines so that they don't start or end with white space.
 *
 * This function performs the 7th step of white space normalization.
 */
function normalizeTextBoundaries(editor, options) {
    const { at, ends = 'trim' } = options;
    const nodePath = Slate.Editor.pathRef(editor, at);
    // Step 1: adjust white space such that no inline element and no marked text
    // start or end with a white space.
    for (const [child, path] of Slate.Node.children(editor, nodePath.current, { reverse: true })) {
        // Recursively normalize nested elements.
        if (Slate.Element.isElement(child)) {
            // TODO: is nested normalization necessary? It would seem that all
            // inline deserializers perform normalization
            normalizeTextBoundaries(editor, { at: path, ends: 'unwrap' });
            continue;
        }
        if (isPlainText$1(child)) {
            continue;
        }
        const [, before, , after] = child.text.match(/^(\s*)(.*?)(\s*)$/);
        if (after.length > 0) {
            Slate.Transforms.splitNodes(editor, {
                at: { path, offset: child.text.length - after.length },
                match: Slate.Text.isText,
            });
            Slate.Transforms.unsetNodes(editor, Object.keys(child), { at: Slate.Path.next(path) });
        }
        if (before.length > 0) {
            Slate.Transforms.splitNodes(editor, {
                at: { path, offset: before.length },
                match: Slate.Text.isText,
            });
            Slate.Transforms.unsetNodes(editor, Object.keys(child), { at: path });
        }
    }
    // Step 2: remove any white space at start and end of this node by either
    // unwrapping or trimming it.
    const end = findWhitespaceBoundary(editor, { at: nodePath.current, affinity: 'end' });
    if (end != null && !Slate.Editor.isEnd(editor, end, nodePath.current)) {
        if (ends === 'unwrap') {
            let start;
            if (end.offset === 0) {
                start = end;
            }
            else {
                Slate.Transforms.splitNodes(editor, { at: end, match: Slate.Text.isText, always: true });
                start = Slate.Path.next(end.path);
            }
            Slate.Transforms.liftNodes(editor, {
                at: Slate.Editor.range(editor, start, nodePath.current),
                match: Slate.Text.isText,
                reverse: true,
            });
        }
        else {
            Slate.Transforms.delete(editor, { at: Slate.Editor.range(editor, end, at), hanging: true });
        }
    }
    const start = findWhitespaceBoundary(editor, { at: nodePath.current, affinity: 'start' });
    if (start != null && !Slate.Editor.isStart(editor, start, nodePath.current)) {
        if (ends === 'unwrap') {
            if (start.offset !== 0) {
                Slate.Transforms.splitNodes(editor, { at: start, match: Slate.Text.isText, always: true });
            }
            Slate.Transforms.liftNodes(editor, {
                at: Slate.Editor.range(editor, nodePath.current, start),
                match: Slate.Text.isText,
            });
        }
        else {
            Slate.Transforms.delete(editor, {
                at: Slate.Editor.range(editor, nodePath.current, start),
                hanging: true,
            });
        }
    }
    // Step 3: merge any two consecutive text elements into one, as long as they
    // have the same properties, and remove empty text nodes.
    collapseAdjacentText(editor, nodePath.current);
    // Step 4: ensure that all elements begin and end with a text node.
    let node = Slate.Node.ancestor(editor, nodePath.current);
    if (!Slate.Text.isText(node.children[node.children.length - 1])) {
        editor.apply({
            type: 'insert_node',
            path: [...nodePath.current, node.children.length],
            node: { text: '' },
        });
    }
    if (!Slate.Text.isText(node.children[0])) {
        editor.apply({
            type: 'insert_node',
            path: [...nodePath.current, 0],
            node: { text: '' },
        });
    }
    // Step 5: ensure that there is a text element between every two inline
    // elements
    node = Slate.Node.ancestor(editor, nodePath.current);
    for (const [inx, child] of enumerate(node.children, true)) {
        if (Slate.Editor.isInline(editor, child) && Slate.Editor.isInline(editor, node.children[inx + 1])) {
            editor.apply({
                type: 'insert_node',
                path: [...nodePath.current, inx + 1],
                node: { text: '' },
            });
        }
    }
    nodePath.unref();
}
function findWhitespaceBoundary(editor, options) {
    const { at, affinity } = options;
    const node = Slate.Node.get(editor, at);
    const re = affinity === 'start' ? /^\s*/u : /\s*$/u;
    if (Slate.Text.isText(node)) {
        const match = node.text.match(re);
        return {
            path: at,
            offset: affinity === 'start'
                ? match[0].length
                : match.index,
        };
    }
    let lastEmpty = false;
    let isFirst = true;
    for (const [index, child] of enumerate(node.children, affinity === 'end')) {
        if (!Slate.Text.isText(child)) {
            if (isFirst || lastEmpty)
                return undefined;
            return affinity === 'start'
                ? Slate.Editor.end(editor, [...at, index - 1])
                : Slate.Editor.start(editor, [...at, index + 1]);
        }
        const match = child.text.match(re);
        if (!isFirst && child.text.length > 0 && match[0].length === 0) {
            return affinity === 'start'
                ? Slate.Editor.end(editor, [...at, index - 1])
                : Slate.Editor.start(editor, [...at, index + 1]);
        }
        lastEmpty = (lastEmpty || isFirst) && child.text.length === 0;
        isFirst = false;
        if (match[0].length === child.text.length)
            continue;
        return {
            path: [...at, index],
            offset: affinity === 'start'
                ? match[0].length
                : match.index,
        };
    }
}
/** Merge any subsequent text elements sharing same properties */
function collapseAdjacentText(editor, at) {
    const node = Slate.Node.ancestor(editor, at);
    for (const [index, child] of enumerate(node.children, true)) {
        const prev = node.children[index - 1];
        if (Slate.Text.isText(child) && Slate.Text.isText(prev)
            && Slate.Text.equals(child, prev, { loose: true })) {
            const { text, ...rest } = child;
            editor.apply({
                type: 'merge_node',
                path: [...at, index],
                position: prev.text.length,
                target: null,
                properties: rest,
            });
        }
    }
}
/**
 * Simplify white space by replacing certain groups of code points with a single
 * codepoint.
 *
 * This function performs steps 1 through 6, assuming that step 7 has already
 * been performed.
 */
function normalizeSpaces(editor, at) {
    const node = Slate.Node.get(editor, at);
    if (!Slate.Text.isText(node)) {
        for (let i = 0; i < node.children.length; ++i) {
            normalizeSpaces(editor, [...at, i]);
        }
        return;
    }
    // no-misleading-character-class warns against using sequences of joining
    // codepoints as they look like a single character but will be matched
    // separately. Here this is exactly what we want, so we can safely disable
    // this lint.
    /* eslint-disable no-misleading-character-class, max-len */
    // NOTE: this is incredibly slow, but necessary, as there may be refs placed
    // in `node`. If we applied all changes at once (as one remove_text and one
    // insert_text operation), position of these refs would be lost.
    // 1st step
    regexReplace(editor, at, /\s/gu, replaceWSChar);
    // 2nd step
    regexReplace(editor, at, /\s[\u180e\u200b\u200c\u200d\u2060]/g, c => c[0]);
    regexReplace(editor, at, /[\u180e\u200b\u200c\u200d\u2060]\s/g, c => c[1]);
    // 3rd step
    regexReplace(editor, at, /[\s\u180e\u200b\u200c\u200d\u2060]{2,}/g, collapseWSSequence);
    // 4th step
    regexReplace(editor, at, /[\u0020\u2000-\u2006\u2008\u2009\u200A\u205F]+([\u1680\u3000])/g, (_, r) => r);
    regexReplace(editor, at, /([\u1680\u3000][\u0020\u2000-\u2006\u2008\u2009\u200A\u205F]+)/g, (_, r) => r);
    // 5th step
    regexReplace(editor, at, /[\u0020\u1680\u2000-\u2006\u2008\u2009\u200A\u205F\u3000]+([\u00a0])/g, (_, r) => r);
    regexReplace(editor, at, /([\u00a0][\u0020\u1680\u2000-\u2006\u2008\u2009\u200A\u205F\u3000]+)/g, (_, r) => r);
    // 6th step
    regexReplace(editor, at, /[\s\u180e\u200b\u200c\u200d\u2060]{2,}/g, c => c[0]);
    /* eslint-enable no-misleading-character-class, max-len */
}
/* eslint-disable @typescript-eslint/naming-convention */
const WHITE_SPACE_MAP = {
    '\u0009': ' ',
    '\u000a': ' ',
    '\u000b': ' ',
    '\u000c': ' ',
    '\u000d': ' ',
    '\u0085': ' ',
    '\u2000': ' ',
    '\u2001': ' ',
    '\u2002': ' ',
    '\u2003': ' ',
    '\u2004': ' ',
    '\u2005': ' ',
    '\u2006': ' ',
    '\u2007': '\u00a0',
    '\u2008': ' ',
    '\u2009': ' ',
    '\u200a': ' ',
    '\u2028': ' ',
    '\u2029': ' ',
    '\u202f': '\u00a0',
    '\u205f': ' ',
    '\ufeff': '\u2060', // ZERO WIDTH NON-BREAKING SPACE
};
/* eslint-enable @typescript-eslint/naming-convention */
function replaceWSChar(char) {
    var _a;
    return (_a = WHITE_SPACE_MAP[char]) !== null && _a !== void 0 ? _a : char;
}
function collapseWSSequence(seq) {
    let start = 0;
    let out = '';
    for (let i = 1; i < seq.length; ++i) {
        if (seq[i] !== seq[start]) {
            out += seq[start];
            start = i;
        }
    }
    if (seq[start] === seq[seq.length - 1]) {
        out += seq[start];
    }
    return out;
}
/**
 * Equivalent of String#replace working on Slate nodes
 *
 * This function will replace each occurrence by issuing `remove_text` and
 * `apply_text` operations.
 *
 * `path` must point at a {@link Text} node.
 */
function regexReplace(editor, path, re, replacer) {
    Slate.Editor.withoutNormalizing(editor, () => {
        const node = Slate.Node.get(editor, path);
        if (!Slate.Text.isText(node)) {
            throw new Error(`Cannot RegExp replace a non-text node at path [${JSON.stringify(path)}]`);
        }
        let adjust = 0;
        for (const m of node.text.matchAll(re)) {
            const [remove, ...args] = m;
            const add = replacer(remove, ...args);
            const offset = m.index + adjust;
            editor.apply({ type: 'remove_text', path, offset, text: remove });
            editor.apply({ type: 'insert_text', path, offset, text: add });
            adjust += add.length - remove.length;
        }
    });
}

const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
const XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';
const CNXML_NAMESPACE = 'http://cnx.rice.edu/cnxml';
/** Natural language extensions to CNXML */
const CMLNLE_NAMESPACE = 'http://katalysteducation.org/cmlnle/1.0';
const CXLXT_NAMESPACE = 'http://katalysteducation.org/cxlxt/1.0';
/** CNXML extensions to facilitate better editing experience */
const EDITING_NAMESPACE = 'http://adaptarr.naukosfera.com/editing/1.0';

// Copyright 2020 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
/**
 * Deserialize a CNXML document from xml or a DOM tree
 *
 * The provided editor will be used for deserialization and will be modified.
 * After deserialization is complete, the editor will contain the same content
 * as the returned {@link Doc} element.
 */
function deserialize(withEditor, xml) {
    var _a, _b;
    if (typeof xml === 'string') {
        xml = new DOMParser().parseFromString(xml, 'application/xml');
        const [error] = xml.getElementsByName('parseerror');
        if (error != null) {
            throw new Error(`Invalid XML: ${error.textContent}`);
        }
    }
    const root = xml.documentElement;
    if (root.namespaceURI !== CNXML_NAMESPACE || root.localName !== 'document') {
        throw new Error(`Invalid XML: root element is {${root.namespaceURI}}${root.localName} instead of {${CNXML_NAMESPACE}}document`);
    }
    const doc = {
        moduleId: (_a = root.getAttribute('module-id')) !== null && _a !== void 0 ? _a : 'new',
        version: ((_b = root.getAttribute('cnxml-version')) !== null && _b !== void 0 ? _b : '0.7'),
        title: '',
        content: [],
    };
    if (doc.version !== '0.7' && doc.version !== '0.8') {
        throw new Error('Only CNXML 0.7 and 0.8 are supported');
    }
    if (root.hasAttributeNS(XML_NAMESPACE, 'lang')) {
        doc.language = root.getAttributeNS(XML_NAMESPACE, 'lang');
    }
    if (root.hasAttribute('class')) {
        doc.classes = cnxDesigner.WithClasses.normalizeClasses([root.getAttribute('class')]);
    }
    const editor = withEditor(withDeserializingEditor(doc, Slate__namespace.createEditor()));
    Slate.Editor.withoutNormalizing(editor, () => {
        var _a;
        for (const child of root.children) {
            if (child.namespaceURI !== CNXML_NAMESPACE) {
                editor.reportError('unexpected-element', {
                    namespace: child.namespaceURI,
                    localName: child.localName,
                });
                continue;
            }
            switch (child.localName) {
                case 'metadata': continue;
                case 'title':
                    doc.title = (_a = child.textContent) !== null && _a !== void 0 ? _a : '';
                    break;
                case 'content':
                    content(editor, child);
                    break;
                case 'glossary':
                    glossary(editor, child);
                    break;
                default:
                    editor.reportError('unexpected-element', {
                        namespace: child.namespaceURI,
                        localName: child.localName,
                    });
                    break;
            }
        }
        doc.content = editor.children;
    });
    if (editor.children !== doc.content) {
        editor.reportError('normalized');
        doc.content = editor.children;
    }
    return editor.finalize();
}
/**
 * Wrap a Slate editor with additional deserialization-oriented functionality
 */
function withDeserializingEditor(doc, ed) {
    const editor = ed;
    editor.deserializeElement = function deserializeElement(el, at, context) {
        if (el.namespaceURI === CNXML_NAMESPACE
            || el.namespaceURI === EDITING_NAMESPACE) {
            const deserializer = context[el.localName];
            if (deserializer != null) {
                return deserializer(editor, el, at);
            }
        }
        editor.unknownElement(el, at, context);
    };
    editor.unknownElement = function unknownElement(el, at, context) {
        if (el.namespaceURI === CNXML_NAMESPACE
            || el.namespaceURI === EDITING_NAMESPACE) {
            const deserializer = FALLBACK[el.localName];
            if (deserializer != null) {
                editor.reportError('unexpected-element', {
                    namespace: el.namespaceURI,
                    localName: el.localName,
                    id: el.getAttribute('id'),
                });
                return deserializer(editor, el, at);
            }
        }
        editor.reportError('unknown-element', {
            namespace: el.namespaceURI,
            localName: el.localName,
            id: el.getAttribute('id'),
        });
        children(editor, el, at, context);
    };
    editor.reportError = function reportError(type, description) {
        console.error(type, description);
    };
    editor.finalize = function finalize() {
        return doc;
    };
    return editor;
}
/**
 * Deserialize children of an element
 *
 * This function will deserialize all child nodes of el, each into a separate
 * Slate node. This means that every XML text node will produce a Slate text
 * node, and all formatting white space will be treated as content, even for
 * block elements. This should later be fixed using {@link normalizeBlock} or
 * {@link normalizeLine}.
 */
function children(editor, el, at, context) {
    const path = Slate.Editor.pathRef(editor, at);
    for (const child of el.childNodes) {
        switch (child.nodeType) {
            case Node.ELEMENT_NODE:
                editor.deserializeElement(child, path.current, context);
                break;
            case Node.TEXT_NODE:
            case Node.CDATA_SECTION_NODE:
                editor.apply({
                    type: 'insert_node',
                    path: path.current,
                    node: { text: child.data },
                });
                break;
            case Node.PROCESSING_INSTRUCTION_NODE:
                editor.apply({
                    type: 'insert_node',
                    path: path.current,
                    node: {
                        type: 'processing_instruction',
                        target: child.target,
                        value: child.data,
                        children: [{ text: '' }],
                    },
                });
                break;
        }
    }
    if (el.childNodes.length === 0) {
        editor.apply({ type: 'insert_node', path: path.current, node: { text: '' } });
    }
    path.unref();
}
/**
 * Build an element according to a template and insert it at a path
 *
 * The template will be extended with additional properties common to all CNXML
 * elements.
 *
 * Element's children will be deserialized using {@link children}.
 */
function buildElement(editor, el, at, template, context) {
    const node = { children: [], ...template };
    if (el.hasAttribute('id')) {
        node.id = el.getAttribute('id');
    }
    if (el.hasAttribute('class')) {
        node.classes = cnxDesigner.WithClasses.normalizeClasses([el.getAttribute('class')]);
    }
    for (const [key, value] of Object.entries(node)) {
        if (key === 'children' || key === 'text')
            continue;
        if (value == null) {
            delete node[key];
        }
    }
    Slate.Transforms.insertNodes(editor, node, { at });
    children(editor, el, [...at, 0], context);
}
/**
 * Normalize a block element after deserialization.
 *
 * All inter-element white space will be removed, and non-white space text will
 * be converted into paragraphs.
 */
function normalizeBlock(editor, at) {
    collapseAdjacentText(editor, at);
    for (const [node, path] of Slate__namespace.Node.children(editor, at, { reverse: true })) {
        if (!Slate.Text.isText(node))
            continue;
        if (/^\s*$/.test(node.text)) {
            editor.apply({ type: 'remove_node', path, node });
        }
        else {
            editor.reportError('text-in-block');
            Slate.Transforms.wrapNodes(editor, {
                type: 'paragraph',
                children: [],
            }, { at: path });
            normalizeWhiteSpace(editor, path);
        }
    }
}
/**
 * Normalize a line element after deserialization
 *
 * White space will be normalized (and trailing removed), and block children
 * will be unwrapped, splitting this element if necessary.
 */
function normalizeLine(editor, at) {
    const node = Slate__namespace.Node.get(editor, at);
    const hasBlocks = node.children.some(n => Slate__namespace.Element.isElement(n) && !editor.isInline(n));
    if (!hasBlocks) {
        normalizeWhiteSpace(editor, at);
    }
    else {
        const next = Slate.Path.next(at);
        let end = node.children.length;
        for (const [inx, child] of enumerate(node.children, true)) {
            if (Slate.Text.isText(child) || editor.isInline(child)) {
                continue;
            }
            if (inx + 1 < end) {
                Slate.Transforms.splitNodes(editor, { at: [...at, inx + 1] });
                normalizeWhiteSpace(editor, next);
                const newNode = Slate__namespace.Node.get(editor, next);
                if (newNode.children.length === 1 && Slate.Text.isText(newNode.children[0])
                    && newNode.children[0].text.match(/^\s*$/)) {
                    Slate.Transforms.removeNodes(editor, { at: next });
                }
            }
            Slate.Transforms.liftNodes(editor, { at: [...at, inx] });
            end = inx;
        }
        if (end > 0) {
            normalizeWhiteSpace(editor, at);
            const newNode = Slate__namespace.Node.get(editor, at);
            if (newNode.children.length === 1 && Slate.Text.isText(newNode.children[0])
                && newNode.children[0].text.match(/^\s*$/)) {
                Slate.Transforms.removeNodes(editor, { at });
            }
        }
    }
}
/** Normalize element which can contain either line content or block content */
function normalizeMixed(editor, at) {
    const node = Slate__namespace.Node.get(editor, at);
    if (!Slate__namespace.Element.isElement(node)) {
        throw new Error(`Cannot normalize node at path [${JSON.stringify(at)}] as it is not an element`);
    }
    const line = node.children.every((n) => Slate.Text.isText(n) || Slate.Editor.isInline(editor, n));
    if (line) {
        Slate.Transforms.wrapNodes(editor, {
            type: 'paragraph',
            children: [],
        }, {
            at,
            match: n => node.children.includes(n),
        });
        normalizeLine(editor, [...at, 0]);
    }
    else {
        normalizeBlock(editor, at);
    }
}
/** Normalize element which shouldn't contain any children */
function normalizeVoid(editor, at) {
    const node = Slate__namespace.Node.get(editor, at);
    if (!Slate__namespace.Element.isElement(node)) {
        throw new Error(`Cannot normalize node at path [${JSON.stringify(at)}] as it is not an element`);
    }
    if (node.children.length > 0) {
        normalizeWhiteSpace(editor, at);
    }
    if (node.children.length === 1
        && Slate.Text.isText(node.children[0]) && node.children[0].text === '') {
        return;
    }
    if (node.children.length > 0) {
        editor.reportError('content-in-void');
    }
    const newPath = Slate.Path.next(at);
    for (let index = node.children.length - 1; index >= 0; --index) {
        editor.apply({ type: 'move_node', path: [...at, index], newPath });
    }
    editor.apply({ type: 'insert_node', path: [...at, 0], node: { text: '' } });
}
/** Build deserializer for block elements */
function block(template, context) {
    const node = typeof template === 'string'
        ? { type: template }
        : template;
    return function deserializer(editor, el, at) {
        buildElement(editor, el, at, node, context);
        normalizeBlock(editor, at);
    };
}
/** Build deserializer for line elements */
function line(template, context) {
    const node = typeof template === 'string'
        ? { type: template }
        : template;
    return function deserializer(editor, el, at) {
        buildElement(editor, el, at, node, context !== null && context !== void 0 ? context : INLINE);
        normalizeLine(editor, at);
    };
}
/** Build deserializer for mixed elements */
function mixed(template, content) {
    const node = typeof template === 'string'
        ? { type: template }
        : template;
    return function deserializer(editor, el, at) {
        buildElement(editor, el, at, node, { ...INLINE, ...content });
        normalizeMixed(editor, at);
    };
}
/** --- deserialization contexts -------------------------------------------- */
/** Deserialize a <caption> */
const caption = line('caption');
/** Deserialize a <title> */
const title = line('title');
/** Inline elements */
const INLINE = {
    code: code$1,
    emphasis: mark,
    footnote: line('footnote'),
    foreign: foreign$1,
    link: link$1,
    sub: mark,
    sup: mark,
    term: term$1,
    preformat,
};
/** Line elements */
const LINE = {
    code: code$1,
    list: list$1,
    para: line('paragraph'),
    preformat,
};
LINE.quote = mixed('quotation', LINE);
/** Deserialize a <definition> */
const definition = block('definition', {
    example: block('definition_example', LINE),
    meaning: mixed('definition_meaning', LINE),
    seealso: block('definition_seealso', { term: definitionTerm }),
    term: definitionTerm,
});
/** Contents of an exercise */
const EXERCISE = {
    commentary: block('exercise_commentary', LINE),
    problem: block('exercise_problem', LINE),
    solution: block('exercise_solution', LINE),
};
/** Contents of a figure */
const FIGURE = {
    caption,
    media: media$1,
    subfigure: block('figure', { media: media$1, caption }),
    title,
};
/** Block elements */
const BLOCK = {
    ...LINE,
    definition,
    exercise: block('exercise', EXERCISE),
    figure: block('figure', FIGURE),
    note,
    rule: rule$1,
};
/** Content of most mixed elements */
const MIXED = { ...LINE, ...INLINE };
/** Media items */
const MEDIA = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'alt-text': line('media_alt', {}),
    audio: mediaItem$1,
    image: mediaItem$1,
    video: mediaItem$1,
};
/** Contents of a rule */
const RULE = {
    example: block('rule_example', LINE),
    proof: block('rule_proof', LINE),
    statement: block('rule_statement', LINE),
    title,
};
/** Contents of a admonition */
const ADMONITION = {
    ...MIXED,
    figure: block('figure', FIGURE),
    title,
};
/** Contents of a list */
const LIST = { item };
/** Contents of a glossary */
const GLOSSARY = { definition };
/** Document content */
const CONTENT = { ...BLOCK, section };
/** Section content */
const SECTION = { ...CONTENT, title };
/** Deserializers to use when one couldn't be found in context */
const FALLBACK = { ...INLINE, ...SECTION, ...MEDIA };
/* --- deserializers -------------------------------------------------------- */
/** Deserialize <code> */
function code$1(editor, el, at) {
    buildElement(editor, el, at, {
        type: 'code',
        language: el.getAttribute('lang'),
        placement: el.getAttribute('display') === 'block' ? 'block' : 'line',
    }, INLINE);
    // NOTE: this element contains pre-formatted content and should not be
    // normalized.
}
/** Deserialize <content> */
function content(editor, el) {
    children(editor, el, [0], CONTENT);
    normalizeBlock(editor, []);
}
/** Deserialize a <term> in <definition> */
function definitionTerm(editor, el, at) {
    buildElement(editor, el, at, {
        type: 'definition_term',
        reference: el.getAttributeNS(CMLNLE_NAMESPACE, 'reference'),
    }, INLINE);
    normalizeLine(editor, at);
}
/** Deserialize <foreign> */
function foreign$1(editor, el, at) {
    buildElement(editor, el, at, {
        type: 'foreign',
        language: el.getAttributeNS(XML_NAMESPACE, 'lang'),
    }, INLINE);
    normalizeLine(editor, at);
}
/** Deserialize <glossary> */
function glossary(editor, el) {
    const path = [editor.children.length];
    buildElement(editor, el, path, { type: 'glossary' }, GLOSSARY);
    normalizeBlock(editor, path);
}
/** Deserialize a list item */
function item(editor, el, at) {
    buildElement(editor, el, at, { type: 'list_item' }, MIXED);
    normalizeMixed(editor, at);
    const node = Slate__namespace.Node.get(editor, at);
    if (node.children.length === 1 && cnxDesigner.List.isList(node.children[0])) {
        Slate.Transforms.unwrapNodes(editor, { at });
    }
}
/** Deserialize a cross-reference, a document reference, or a hyperlink */
function link$1(editor, el, at) {
    const target = el.getAttribute('target-id');
    const document = el.getAttribute('document');
    const url = el.getAttribute('url');
    if (target != null) {
        buildElement(editor, el, at, {
            type: 'xref',
            target,
            document,
            case: el.getAttributeNS(CMLNLE_NAMESPACE, 'case'),
            children: [],
        }, {});
        normalizeVoid(editor, at);
    }
    else if (url != null) {
        buildElement(editor, el, at, { type: 'link', url }, INLINE);
        normalizeLine(editor, at);
    }
    else if (document != null) {
        buildElement(editor, el, at, {
            type: 'docref',
            document,
            case: el.getAttributeNS(CMLNLE_NAMESPACE, 'case'),
        }, INLINE);
        normalizeVoid(editor, at);
    }
    else {
        editor.reportError('link-missing-target');
        children(editor, el, at, INLINE);
    }
}
function list$1(editor, el, at) {
    var _a, _b, _c;
    const props = el.getAttribute('list-type') === 'enumerated'
        ? {
            type: 'list',
            style: 'enumerated',
            numberStyle: (_a = el.getAttribute('number-style')) !== null && _a !== void 0 ? _a : 'arabic',
            start: Number((_b = el.getAttribute('start-value')) !== null && _b !== void 0 ? _b : 1),
        }
        : {
            type: 'list',
            style: 'bulleted',
            bullet: (_c = el.getAttribute('bullet')) !== null && _c !== void 0 ? _c : 'bullet',
        };
    buildElement(editor, el, at, props, LIST);
    normalizeBlock(editor, at);
}
const MARKS = {
    sub: { position: 'subscript' },
    sup: { position: 'superscript' },
    bold: { strong: true },
    underline: { underline: true },
    italics: { emphasis: true },
};
/** Deserialize a styling element */
function mark(editor, el, at) {
    var _a;
    const mark = el.localName === 'emphasis'
        ? (_a = el.getAttribute('effect')) !== null && _a !== void 0 ? _a : 'bold'
        : el.localName;
    const props = MARKS[mark];
    const end = Slate.Editor.pathRef(editor, at);
    children(editor, el, at, INLINE);
    if (props != null) {
        Slate.Transforms.setNodes(editor, props, {
            at: Slate.Editor.range(editor, at, Slate.Path.previous(end.current)),
            match: Slate.Text.isText,
        });
    }
    end.unref();
}
/** Deserialize media container */
function media$1(editor, el, at) {
    buildElement(editor, el, at, { type: 'media' }, MEDIA);
    const node = Slate__namespace.Node.get(editor, at);
    if (!node.children.some((n) => n.type === 'media_alt')
        && el.hasAttribute('alt')) {
        const path = [...at, node.children.length];
        editor.apply({
            type: 'insert_node',
            path,
            node: {
                type: 'media_alt',
                children: [{ text: el.getAttribute('alt') }],
            },
        });
        normalizeWhiteSpace(editor, path);
    }
    normalizeBlock(editor, at);
}
/** Deserialize a media item */
function mediaItem$1(editor, el, at) {
    const use = el.getAttribute('for');
    buildElement(editor, el, at, {
        type: 'media_' + el.localName,
        src: el.getAttribute('src'),
        intendedUse: cnxDesigner.MediaUse.isMediaUse(use) ? use : 'all',
    }, {});
    normalizeVoid(editor, at);
}
/** Deserialize an admonition */
function note(editor, el, at) {
    var _a;
    buildElement(editor, el, at, {
        type: 'admonition',
        kind: (_a = el.getAttribute('type')) !== null && _a !== void 0 ? _a : 'note',
    }, ADMONITION);
    normalizeMixed(editor, at);
}
/** Deserialize <preformat> */
function preformat(editor, el, at) {
    buildElement(editor, el, at, { type: 'preformat' }, INLINE);
    // NOTE: this element contains pre-formatted content and should not be
    // normalized.
}
/** Deserialize a rule */
function rule$1(editor, el, at) {
    var _a;
    buildElement(editor, el, at, {
        type: 'rule',
        kind: (_a = el.getAttribute('type')) !== null && _a !== void 0 ? _a : 'rule',
    }, RULE);
    normalizeBlock(editor, at);
}
/** Deserialize a <section> */
function section(editor, el, at) {
    buildElement(editor, el, at, { type: 'section' }, SECTION);
    normalizeBlock(editor, at);
}
/** Deserialize a <term> */
function term$1(editor, el, at) {
    buildElement(editor, el, at, {
        type: 'term',
        index: el.getAttributeNS(CXLXT_NAMESPACE, 'index'),
        reference: el.getAttributeNS(CMLNLE_NAMESPACE, 'reference'),
        name: el.getAttributeNS(CXLXT_NAMESPACE, 'name'),
        born: el.hasAttributeNS(CXLXT_NAMESPACE, 'born')
            ? Number(el.getAttributeNS(CXLXT_NAMESPACE, 'born'))
            : undefined,
        died: el.hasAttributeNS(CXLXT_NAMESPACE, 'died')
            ? Number(el.getAttributeNS(CXLXT_NAMESPACE, 'died'))
            : undefined,
    }, INLINE);
    normalizeLine(editor, at);
}

// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

var jsx$1 = /*#__PURE__*/Object.freeze({
    __proto__: null
});

// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
/** Old-style JSX factory */
function createElement(name, attrs, ...children) {
    const { xmlns, ...attributes } = attrs !== null && attrs !== void 0 ? attrs : {};
    return {
        name: { namespace: xmlns, local: name },
        attributes,
        children,
    };
}
/** New-style JSX factory */
function jsx(name, props) {
    const { xmlns, children, ...attributes } = props;
    return {
        name: { namespace: xmlns, local: name },
        attributes,
        children: children !== null && children !== void 0 ? children : [],
    };
}
const jsxs = jsx;

// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
const Node$1 = {
    isElement(node) {
        return isPlainObject.isPlainObject(node) && typeof node.name === 'object';
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
function render(root) {
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
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                val = value.toString();
                break;
            default:
                continue;
        }
        const r = key.match(/^([a-z]+)([A-Z][a-z-]*)$/);
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
        else if (Node$1.isProcessingInstruction(child)) {
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

/** Serialize a document to CNXML */
function serialize(editor, doc, options) {
    var _a;
    const { format, mediaMime } = options;
    const context = {
        mediaMime,
        serializeElement: options.serializeElement,
        serializeText: options.serializeText,
    };
    const content = doc.content.map(n => serializeElement(editor, n, context));
    const glossary = cnxDesigner.Glossary.isGlossary(doc.content[doc.content.length - 1])
        ? content.pop()
        : null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const document = render(jsxs("document", { xmlns: CNXML_NAMESPACE, "cnxml-version": doc.version, id: doc.moduleId, "module-id": doc.moduleId, xmlLang: doc.language, class: (_a = doc.classes) === null || _a === void 0 ? void 0 : _a.join(' '), children: [jsx("title", { children: doc.title }), jsx("content", { children: content }), glossary] }));
    if (format === 'dom') {
        return document;
    }
    let x = new XMLSerializer().serializeToString(document);
    // Some browsers serialize XML without declaration.
    if (!x.startsWith('<?xml')) {
        x = `<?xml version="1.0" encoding="${document.characterSet}"?>\n${x}`;
    }
    return x;
}
/** Serialize a single node */
function serializeElement(editor, node, ctx) {
    var _a;
    if (Slate.Text.isText(node)) {
        let n = node.text;
        for (const style of STYLES) {
            if (style in node) {
                n = applyTextStyle(style, node[style], n);
            }
        }
        if (ctx.serializeText != null) {
            n = (_a = ctx.serializeText(node, {}, n, ctx)) !== null && _a !== void 0 ? _a : n;
        }
        return n;
    }
    const children = Slate.Editor.hasInlines(editor, node)
        ? serializeLine(editor, node, ctx)
        : node.children.map(n => serializeElement(editor, n, ctx));
    const attributes = {
        id: node.id || `UUID${v4()}`,
    };
    if (cnxDesigner.WithClasses.hasClasses(node)) {
        attributes.class = node.classes.join(' ');
    }
    if (ctx.serializeElement != null) {
        const n = ctx.serializeElement(node, attributes, children, ctx);
        if (n != null) {
            return n;
        }
    }
    for (const [test, serializer] of SERIALIZERS) {
        if (test(node)) {
            return serializer(node, attributes, children, ctx);
        }
    }
    throw new Error(`no serializer defined for ${JSON.stringify(node)}`);
}
/** Check if a node contains only plain, unmarked text */
function isPlainText(node) {
    if (Slate.Element.isElement(node)) {
        return node.children.every(isPlainText);
    }
    for (const key in node) {
        if (key === 'text')
            continue;
        if (key === 'position' && node[key] === 'normal')
            continue;
        return false;
    }
    return true;
}
const STYLES = ['emphasis', 'underline', 'strong', 'position'];
/** Apply a single text style to a rendered inline node or text */
function applyTextStyle(style, value, node) {
    switch (style) {
        case 'emphasis':
            return value
                ? jsx("emphasis", { xmlns: CNXML_NAMESPACE, effect: "italics", children: node })
                : node;
        case 'strong':
            return value
                ? jsx("emphasis", { xmlns: CNXML_NAMESPACE, effect: "bold", children: node })
                : node;
        case 'underline':
            return value
                ? jsx("emphasis", { xmlns: CNXML_NAMESPACE, effect: "underline", children: node })
                : node;
        case 'position':
            return value === 'superscript'
                ? jsx("sup", { xmlns: CNXML_NAMESPACE, children: node })
                : value === 'subscript'
                    ? jsx("sub", { xmlns: CNXML_NAMESPACE, children: node })
                    : node;
    }
}
/** Apply collection of text styles to a rendered inline node or text */
function applyStyle(styles, node) {
    for (const [style, value] of styles) {
        node = applyTextStyle(style, value, node);
    }
    return node;
}
/** Serialize a single line of text */
function serializeLine(editor, node, ctx) {
    var _a;
    const out = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const text = [[new Map(), []]];
    /** Flush all accumulated text into output */
    function flush() {
        while (text.length > 1) {
            const [style, nodes] = text.pop();
            text[text.length - 1][1].push(applyStyle(style, nodes));
        }
        const [style, nodes] = text.pop();
        text.push([new Map(), []]);
        out.push(applyStyle(style, nodes));
    }
    /** Collapse style stack below certain depth */
    function collapse(from) {
        for (let i = text.length - 1; i > from; --i) {
            const [style, nodes] = text[i];
            if (nodes.length > 0) {
                text[i - 1][1].push(applyStyle(style, nodes));
                text[i][1] = [];
            }
        }
    }
    /** Apply style to all future text */
    function changeStyle(changed) {
        const keep = new Set();
        // Remove from changed any styles which are already present on
        // the stack.
        for (const [style] of text) {
            for (const [name, value] of style) {
                if (changed.has(name) && changed.get(name) === value) {
                    changed.delete(name);
                    keep.add(name);
                }
            }
        }
        // Then remove from the stack any unwanted styles.
        for (let i = text.length - 1; i >= 0; --i) {
            const [style] = text[i];
            for (const [name, value] of style) {
                // Since we want to keep each style in only one stack entry,
                // this check is necessary to prevent styles we want to keep
                // from being collapsed (as since they were removed from changed
                // the next if would consider them unwanted).
                if (keep.has(name))
                    continue;
                if (!changed.has(name) || changed.get(name) !== value) {
                    collapse(i);
                    text[i][1] = [applyTextStyle(name, value, text[i][1])];
                    style.delete(name);
                }
            }
            // If all styles at this depth were removed, drop this entry.
            if (style.size === 0 && i > 0) {
                collapse(i);
                text[i - 1][1].push(...text[i][1]);
                text.splice(i, 1);
            }
        }
        if (changed.size > 0) {
            text.push([changed, []]);
        }
    }
    for (const child of node.children) {
        if (!Slate.Text.isText(child)) {
            flush();
            out.push(serializeElement(editor, child, ctx));
            continue;
        }
        const style = new Map();
        for (const k of STYLES) {
            if (k in child) {
                style.set(k, child[k]);
            }
        }
        // TODO: there should be a better way to check if a custom serializer
        // wants to serialize a text node other than invoking it.
        if (((_a = ctx.serializeText) === null || _a === void 0 ? void 0 : _a.call(ctx, child, {}, child.text, ctx)) != null) {
            flush();
            out.push(ctx.serializeText(child, {}, applyStyle(style, child.text), ctx));
            continue;
        }
        changeStyle(style);
        text[text.length - 1][1].push(child.text);
    }
    flush();
    return out;
}
/**
 * Node serializers
 *
 * The first element of each entry is a node matcher, the second is a serializer
 * function. {@link serializeElement} will use serializer function of the first
 * entry whose matcher function returned true.
 */
const SERIALIZERS = [
    [cnxDesigner.Admonition.isAdmonition, admonition],
    [cnxDesigner.AltText.isAltText, altText],
    [cnxDesigner.Audio.isAudio, mediaItem],
    [cnxDesigner.Caption.isCaption, makeSerializer('caption')],
    [cnxDesigner.Code.isCode, code],
    [cnxDesigner.Commentary.isCommentary, makeSerializer('commentary')],
    [cnxDesigner.CrossReference.isCrossReference, xref],
    [cnxDesigner.Definition.isDefinition, makeSerializer('definition')],
    [cnxDesigner.DefinitionExample.isDefinitionExample, makeSerializer('example')],
    [cnxDesigner.DefinitionTerm.isDefinitionTerm, term],
    [cnxDesigner.DocumentReference.isDocumentReference, docref],
    [cnxDesigner.Exercise.isExercise, makeSerializer('exercise')],
    [cnxDesigner.Figure.isFigure, figure],
    [cnxDesigner.Footnote.isFootnote, makeSerializer('footnote')],
    [cnxDesigner.Foreign.isForeign, foreign],
    [cnxDesigner.Glossary.isGlossary, makeSerializer('glossary')],
    [cnxDesigner.Image.isImage, mediaItem],
    [cnxDesigner.Link.isLink, link],
    [cnxDesigner.List.isList, list],
    [cnxDesigner.ListItem.isListItem, makeSerializer('item')],
    [cnxDesigner.Meaning.isMeaning, makeSerializer('meaning')],
    [cnxDesigner.Media.isMedia, media],
    [cnxDesigner.Paragraph.isParagraph, makeSerializer('para')],
    [cnxDesigner.Preformat.isPreformat, makeSerializer('preformat')],
    [cnxDesigner.ProcessingInstruction.isProcessingInstruction, processingInstruction],
    [cnxDesigner.Problem.isProblem, makeSerializer('problem')],
    [cnxDesigner.Proof.isProof, makeSerializer('proof')],
    [cnxDesigner.Quotation.isQuotation, makeSerializer('quote')],
    [cnxDesigner.Rule.isRule, rule],
    [cnxDesigner.RuleExample.isRuleExample, makeSerializer('example')],
    [cnxDesigner.Section.isSection, makeSerializer('section')],
    [cnxDesigner.SeeAlso.isSeeAlso, makeSerializer('seealso')],
    [cnxDesigner.Solution.isSolution, makeSerializer('solution')],
    [cnxDesigner.Statement.isStatement, makeSerializer('statement')],
    [cnxDesigner.Term.isTerm, term],
    [cnxDesigner.Title.isTitle, makeSerializer('title')],
    [cnxDesigner.Video.isVideo, mediaItem],
    // XXX: what we'd like to do is type this array as
    // (<T extends Node> SerializerEntry<T>)[], but since such types aren't
    // currently supported we need this cast.
];
/** Create a serializer to a given tag from a given namespace */
// eslint-disable-next-line @typescript-eslint/naming-convention
function makeSerializer(Tag, namespace = CNXML_NAMESPACE) {
    return function serializer(node, attrs, children) {
        return jsx(Tag, { xmlns: namespace, ...attrs, children: children });
    };
}
function admonition(node, attrs, children) {
    return jsx("note", { xmlns: CNXML_NAMESPACE, type: node.kind, ...attrs, children: children });
}
function altText(node, attrs, children) {
    // If alt-text contains only plain text it will be instead emitted in an
    // alt attribute on a <media> element.
    if (isPlainText(node)) {
        return null;
    }
    return jsx("alt-text", { xmlns: EDITING_NAMESPACE, ...attrs, children: children });
}
function code(node, attrs, children) {
    return jsx("code", { xmlns: CNXML_NAMESPACE, display: node.placement === 'block' ? 'block' : undefined, lang: node.language, ...attrs, children: children });
}
function docref(node, attrs, children) {
    return jsx("link", { xmlns: CNXML_NAMESPACE, document: node.document, cmlnleCase: node.case, ...attrs, children: children });
}
function figure(node, attrs, children) {
    function mapChild(child) {
        if (Array.isArray(child)) {
            return child.map(mapChild);
        }
        if (!Node$1.isElement(child)) {
            return child;
        }
        if (child.name.namespace === CNXML_NAMESPACE
            && child.name.local === 'figure') {
            return {
                ...child,
                name: {
                    namespace: CNXML_NAMESPACE,
                    local: 'subfigure',
                },
            };
        }
        return child;
    }
    return jsx("figure", { xmlns: CNXML_NAMESPACE, ...attrs, children: mapChild(children) });
}
function foreign(node, attrs, children) {
    return jsx("foreign", { xmlns: CNXML_NAMESPACE, xmlLang: node.language, ...attrs, children: children });
}
function link(node, attrs, children) {
    return jsx("link", { xmlns: CNXML_NAMESPACE, url: node.url, ...attrs, children: children });
}
function list(node, attrs, children) {
    function mapChild(child) {
        if (Array.isArray(child))
            return child.map(mapChild);
        if (!Node$1.isElement(child)) {
            return child;
        }
        if ((child.name.namespace == null || child.name.namespace === CNXML_NAMESPACE)
            && child.name.local === 'list') {
            return jsx("item", { xmlns: CNXML_NAMESPACE, children: child });
        }
        return child;
    }
    return jsx("list", { xmlns: CNXML_NAMESPACE, "list-type": node.style === 'enumerated' ? node.style : undefined, "bullet-style": (node.bullet !== 'bullet' ? node.bullet : undefined), "number-style": (node.numberStyle !== 'arabic' ? node.numberStyle : undefined), "start-value": (node.start !== 1 ? node.start : undefined), ...attrs, children: mapChild(children) });
}
function media(node, attrs, children) {
    let alt;
    const altNode = node.children.find(n => cnxDesigner.AltText.isAltText(n));
    if (altNode != null && isPlainText(altNode)) {
        alt = Slate.Node.string(altNode);
    }
    return jsx("media", { xmlns: CNXML_NAMESPACE, alt: alt, ...attrs, children: children });
}
function mediaItem(node, attrs, children, ctx) {
    const Tag = node.type.slice(6);
    return jsx(Tag, { xmlns: CNXML_NAMESPACE, src: node.src, "mime-type": ctx.mediaMime(node), for: node.intendedUse === 'all' ? undefined : node.intendedUse, ...attrs, children: children });
}
function processingInstruction(node) {
    return { target: node.target, value: node.value };
}
function rule(node, attrs, children) {
    return jsx("rule", { xmlns: CNXML_NAMESPACE, type: node.kind === 'rule' ? undefined : node.kind, ...attrs, children: children });
}
function term(node, attrs, children) {
    const nameIndexAttributes = {};
    if (cnxDesigner.Term.isNameTerm(node)) {
        nameIndexAttributes.cxlxtName = node.name;
        nameIndexAttributes.cxlxtBorn = node.born;
        nameIndexAttributes.cxlxtDied = node.died;
    }
    return jsx("term", { xmlns: CNXML_NAMESPACE, cxlxtIndex: node.index, cmlnleReference: node.reference, ...nameIndexAttributes, ...attrs, children: children });
}
function xref(node, attrs, children) {
    var _a;
    return jsx("link", { xmlns: CNXML_NAMESPACE, "target-id": node.target, document: (_a = node.document) !== null && _a !== void 0 ? _a : undefined, cmlnleCase: node.case, ...attrs, children: children });
}

exports.BLOCK = BLOCK;
exports.CMLNLE_NAMESPACE = CMLNLE_NAMESPACE;
exports.CNXML_NAMESPACE = CNXML_NAMESPACE;
exports.CXLXT_NAMESPACE = CXLXT_NAMESPACE;
exports.EDITING_NAMESPACE = EDITING_NAMESPACE;
exports.INLINE = INLINE;
exports.JSX = jsx$1;
exports.LINE = LINE;
exports.MIXED = MIXED;
exports.Node = Node$1;
exports.XMLNS_NAMESPACE = XMLNS_NAMESPACE;
exports.XML_NAMESPACE = XML_NAMESPACE;
exports.buildElement = buildElement;
exports.children = children;
exports.createElement = createElement;
exports.deserialize = deserialize;
exports.jsx = jsx;
exports.jsxs = jsxs;
exports.normalizeBlock = normalizeBlock;
exports.normalizeLine = normalizeLine;
exports.normalizeMixed = normalizeMixed;
exports.normalizeVoid = normalizeVoid;
exports.render = render;
exports.serialize = serialize;
//# sourceMappingURL=index.cjs.js.map
