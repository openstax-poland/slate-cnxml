import { jsx as _jsx, jsxs as _jsxs } from "./jsx-runtime";
// Copyright 2020 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.
import { Admonition, AltText, Audio, Caption, Code, Commentary, CrossReference, Definition, DefinitionExample, DefinitionTerm, DocumentReference, Exercise, Figure, Footnote, Foreign, Glossary, Image, Link, List, ListItem, Meaning, Media, Paragraph, Preformat, Problem, ProcessingInstruction, Proof, Quotation, Rule, RuleExample, Section, SeeAlso, Solution, Statement, Term, Title, Video, WithClasses, } from 'cnx-designer';
import { Editor, Element, Node, Text } from 'slate';
import { CNXML_NAMESPACE, EDITING_NAMESPACE } from './consts';
import { render, Node as RenderNode } from './render';
import { uuid } from './util';
/** Serialize a document to CNXML */
export default function serialize(editor, doc, options) {
    var _a;
    const { format, mediaMime } = options;
    const context = {
        mediaMime,
        serializeNode: options.serializeNode,
    };
    const content = doc.content.map(n => serializeNode(editor, n, context));
    const glossary = Glossary.isGlossary(doc.content[doc.content.length - 1])
        ? content.pop()
        : null;
    const document = render(_jsxs("document", Object.assign({ xmlns: CNXML_NAMESPACE, "cnxml-version": doc.version, id: doc.moduleId, "module-id": doc.moduleId, xmlLang: doc.language, class: (_a = doc.classes) === null || _a === void 0 ? void 0 : _a.join(' ') }, { children: [_jsx("title", { children: doc.title }, void 0),
            _jsx("content", { children: content }, void 0), glossary] }), void 0));
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
function serializeNode(editor, node, ctx) {
    if (Text.isText(node)) {
        let n = node.text;
        for (const style of STYLES) {
            if (style in node) {
                n = applyTextStyle(style, node[style], n);
            }
        }
        return n;
    }
    const children = Editor.hasInlines(editor, node)
        ? serializeLine(editor, node, ctx)
        : node.children.map(n => serializeNode(editor, n, ctx));
    const attributes = {
        id: node.id || `UUID${uuid.v4()}`,
    };
    if (WithClasses.hasClasses(node)) {
        attributes.class = node.classes.join(' ');
    }
    if (ctx.serializeNode != null) {
        const n = ctx.serializeNode(node, attributes, children, ctx);
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
    if (Element.isElement(node)) {
        return node.children.every(isPlainText);
    }
    const text = node;
    return !text.emphasis
        && !text.strong
        && (text.position == null || text.position === 'normal');
}
const STYLES = ['emphasis', 'underline', 'strong', 'position'];
/** Apply a single text style to a rendered inline node or text */
function applyTextStyle(style, value, node) {
    switch (style) {
        case 'emphasis':
            return value
                ? _jsx("emphasis", Object.assign({ xmlns: CNXML_NAMESPACE, effect: "italics" }, { children: node }), void 0)
                : node;
        case 'strong':
            return value
                ? _jsx("emphasis", Object.assign({ xmlns: CNXML_NAMESPACE, effect: "bold" }, { children: node }), void 0)
                : node;
        case 'underline':
            return value
                ? _jsx("emphasis", Object.assign({ xmlns: CNXML_NAMESPACE, effect: "underline" }, { children: node }), void 0)
                : node;
        case 'position':
            return value === 'superscript'
                ? _jsx("sup", Object.assign({ xmlns: CNXML_NAMESPACE }, { children: node }), void 0)
                : value === 'subscript'
                    ? _jsx("sub", Object.assign({ xmlns: CNXML_NAMESPACE }, { children: node }), void 0)
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
    const out = [];
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
        if (!Text.isText(child)) {
            flush();
            out.push(serializeNode(editor, child, ctx));
            continue;
        }
        const style = new Map();
        for (const k of STYLES) {
            if (k in child) {
                style.set(k, child[k]);
            }
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
 * function. {@link serializeNode} will use serializer function of the first
 * entry whose matcher function returned true.
 */
const SERIALIZERS = [
    [Admonition.isAdmonition, admonition],
    [AltText.isAltText, altText],
    [Audio.isAudio, mediaItem],
    [Caption.isCaption, makeSerializer('caption')],
    [Code.isCode, code],
    [Commentary.isCommentary, makeSerializer('commentary')],
    [CrossReference.isCrossReference, xref],
    [Definition.isDefinition, makeSerializer('definition')],
    [DefinitionExample.isDefinitionExample, makeSerializer('example')],
    [DefinitionTerm.isDefinitionTerm, term],
    [DocumentReference.isDocumentReference, docref],
    [Exercise.isExercise, makeSerializer('exercise')],
    [Figure.isFigure, figure],
    [Footnote.isFootnote, makeSerializer('footnote')],
    [Foreign.isForeign, foreign],
    [Glossary.isGlossary, makeSerializer('glossary')],
    [Image.isImage, mediaItem],
    [Link.isLink, link],
    [List.isList, list],
    [ListItem.isListItem, makeSerializer('item')],
    [Meaning.isMeaning, makeSerializer('meaning')],
    [Media.isMedia, media],
    [Paragraph.isParagraph, makeSerializer('para')],
    [Preformat.isPreformat, makeSerializer('preformat')],
    [ProcessingInstruction.isProcessingInstruction, processingInstruction],
    [Problem.isProblem, makeSerializer('problem')],
    [Proof.isProof, makeSerializer('proof')],
    [Quotation.isQuotation, makeSerializer('quote')],
    [Rule.isRule, rule],
    [RuleExample.isRuleExample, makeSerializer('example')],
    [Section.isSection, makeSerializer('section')],
    [SeeAlso.isSeeAlso, makeSerializer('seealso')],
    [Solution.isSolution, makeSerializer('solution')],
    [Statement.isStatement, makeSerializer('statement')],
    [Term.isTerm, term],
    [Title.isTitle, makeSerializer('title')],
    [Video.isVideo, mediaItem],
    // XXX: what we'd like to do is type this array as
    // (<T extends Node> SerializerEntry<T>)[], but since such types aren't
    // currently supported we need this cast.
];
/** Create a serializer to a given tag from a given namespace */
// eslint-disable-next-line @typescript-eslint/naming-convention
function makeSerializer(Tag, namespace = CNXML_NAMESPACE) {
    return function serializer(node, attrs, children) {
        return _jsx(Tag, Object.assign({ xmlns: namespace }, attrs, { children: children }), void 0);
    };
}
function admonition(node, attrs, children) {
    return _jsx("note", Object.assign({ xmlns: CNXML_NAMESPACE, type: node.kind }, attrs, { children: children }), void 0);
}
function altText(node, attrs, children) {
    // If alt-text contains only plain text it will be instead emitted in an
    // alt attribute on a <media> element.
    if (isPlainText(node)) {
        return null;
    }
    return _jsx("alt-text", Object.assign({ xmlns: EDITING_NAMESPACE }, attrs, { children: children }), void 0);
}
function code(node, attrs, children) {
    return _jsx("code", Object.assign({ xmlns: CNXML_NAMESPACE, display: node.placement === 'block' ? 'block' : undefined, lang: node.language }, attrs, { children: children }), void 0);
}
function docref(node, attrs, children) {
    return _jsx("link", Object.assign({ xmlns: CNXML_NAMESPACE, document: node.document }, attrs, { children: children }), void 0);
}
function figure(node, attrs, children) {
    function mapChild(child) {
        if (Array.isArray(child)) {
            return child.map(mapChild);
        }
        if (!RenderNode.isElement(child)) {
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
    return _jsx("figure", Object.assign({ xmlns: CNXML_NAMESPACE }, attrs, { children: mapChild(children) }), void 0);
}
function foreign(node, attrs, children) {
    return _jsx("foreign", Object.assign({ xmlns: CNXML_NAMESPACE, xmlLang: node.language }, attrs, { children: children }), void 0);
}
function link(node, attrs, children) {
    return _jsx("link", Object.assign({ xmlns: CNXML_NAMESPACE, url: node.url }, attrs, { children: children }), void 0);
}
function list(node, attrs, children) {
    function mapChild(child) {
        if (Array.isArray(child))
            return child.map(mapChild);
        if (!RenderNode.isElement(child)) {
            return child;
        }
        if ((child.name.namespace == null || child.name.namespace === CNXML_NAMESPACE)
            && child.name.local === 'list') {
            return _jsx("item", Object.assign({ xmlns: CNXML_NAMESPACE }, { children: child }), void 0);
        }
        return child;
    }
    return _jsx("list", Object.assign({ xmlns: CNXML_NAMESPACE, "list-type": node.style === 'enumerated' ? node.style : undefined, "bullet-style": (node.bullet !== 'bullet' ? node.bullet : undefined), "number-style": (node.numberStyle !== 'arabic' ? node.numberStyle : undefined), "start-value": (node.start !== 1 ? node.start : undefined) }, attrs, { children: mapChild(children) }), void 0);
}
function media(node, attrs, children) {
    let alt;
    const altNode = node.children.find(n => AltText.isAltText(n));
    if (altNode != null && isPlainText(altNode)) {
        alt = Node.string(altNode);
    }
    return _jsx("media", Object.assign({ xmlns: CNXML_NAMESPACE, alt: alt }, attrs, { children: children }), void 0);
}
function mediaItem(node, attrs, children, ctx) {
    const Tag = node.type.slice(6);
    return _jsx(Tag, Object.assign({ xmlns: CNXML_NAMESPACE, src: node.src, "mime-type": ctx.mediaMime(node), for: node.intendedUse === 'all' ? undefined : node.intendedUse }, attrs, { children: children }), void 0);
}
function processingInstruction(node) {
    return { target: node.target, value: node.value };
}
function rule(node, attrs, children) {
    return _jsx("rule", Object.assign({ xmlns: CNXML_NAMESPACE, type: node.kind === 'rule' ? undefined : node.kind }, attrs, { children: children }), void 0);
}
function term(node, attrs, children) {
    const nameIndexAttributes = {};
    if (Term.isNameTerm(node)) {
        nameIndexAttributes.cxlxtName = node.name;
        nameIndexAttributes.cxlxtBorn = node.born;
        nameIndexAttributes.cxlxtDied = node.died;
    }
    return _jsx("term", Object.assign({ xmlns: CNXML_NAMESPACE, cxlxtIndex: node.index, cmlnleReference: node.reference }, nameIndexAttributes, attrs, { children: children }), void 0);
}
function xref(node, attrs, children) {
    var _a;
    return _jsx("link", Object.assign({ xmlns: CNXML_NAMESPACE, "target-id": node.target, document: (_a = node.document) !== null && _a !== void 0 ? _a : undefined, cmlnleCase: node.case }, attrs, { children: children }), void 0);
}
