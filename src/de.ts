// Copyright 2020 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import * as Slate from 'slate'
import * as CNX from 'cnx-designer'
import { List, MediaUse, StyledText, Table, WithClasses } from 'cnx-designer'
import { Editor, Path, Text, Transforms } from 'slate'

import normalizeWhiteSpace, { collapseAdjacentText } from './whitespace'
import { CnxmlVersion, Document as Doc } from '.'
import {
    CMLNLE_NAMESPACE, CNXML_NAMESPACE, CXLXT_NAMESPACE, EDITING_NAMESPACE, XML_NAMESPACE,
} from './consts'
import { enumerate } from './util'

/**
 * Editor used for deserialization
 *
 * This interface extends Slate's editor with various methods used for
 * deserialization. Those methods (as well as those of Editor) can be
 * overwritten to customize how a document is deserialized.
 */
export interface DeserializingEditor extends Editor {
    errors: DeserializingError[]

    /**
     * Deserialize an element
     *
     * This function is passed the element to deserialize, path at which nodes
     * it deserializes to should be inserted, and a context defining what
     * elements were expected at this place in the document.
     */
    deserializeElement(el: Element, at: Path, context: Deserializers): void

    /**
     * Handle unknown element
     *
     * This function is called by {@link #deserializeElement} for elements which
     * are either unknown or unexpected at a given place in document.
     */
    unknownElement(el: Element, at: Path, context: Deserializers): void

    /**
     * Report a deserialization problem
     *
     * `type` is a code describing the error and should only contain letters and
     * hyphens. `description` contains additional information which may be used
     * to format a user message.
     */
    reportError(type: string, description?: { [key: string]: unknown }): void

    /** Finalize deserialization */
    finalize(): Doc
}

export interface DeserializingError {
    type: string
    [key: string]: unknown
}

/**
 * Deserialize a CNXML document from xml or a DOM tree
 *
 * The provided editor will be used for deserialization and will be modified.
 * After deserialization is complete, the editor will contain the same content
 * as the returned {@link Doc} element.
 */
export default function deserialize(
    withEditor: (editor: DeserializingEditor) => DeserializingEditor,
    xml: string | Document,
): Doc {
    if (typeof xml === 'string') {
        xml = new DOMParser().parseFromString(xml, 'application/xml')
        const [error] = xml.getElementsByName('parseerror')

        if (error != null) {
            throw new Error(`Invalid XML: ${error.textContent}`)
        }
    }

    const root = xml.documentElement

    if (root.namespaceURI !== CNXML_NAMESPACE || root.localName !== 'document') {
        throw new Error(`Invalid XML: root element is {${root.namespaceURI}}${
            root.localName} instead of {${CNXML_NAMESPACE}}document`)
    }

    const doc: Doc = {
        moduleId: root.getAttribute('module-id') ?? 'new',
        version: (root.getAttribute('cnxml-version') ?? '0.7') as CnxmlVersion,
        title: '',
        content: [],
    }

    if (doc.version !== '0.7' && doc.version !== '0.8') {
        throw new Error('Only CNXML 0.7 and 0.8 are supported')
    }

    if (root.hasAttributeNS(XML_NAMESPACE, 'lang')) {
        doc.language = root.getAttributeNS(XML_NAMESPACE, 'lang')!
    }

    if (root.hasAttribute('class')) {
        doc.classes = WithClasses.normalizeClasses([root.getAttribute('class')!])
    }

    const editor = withEditor(withDeserializingEditor(doc, Slate.createEditor()))

    Editor.withoutNormalizing(editor, () => {
        for (const child of root.children) {
            if (child.namespaceURI !== CNXML_NAMESPACE) {
                editor.reportError('unexpected-element', {
                    namespace: child.namespaceURI,
                    localName: child.localName,
                })
                continue
            }

            switch (child.localName) {
            case 'metadata': continue

            case 'title':
                doc.title = child.textContent ?? ''
                break

            case 'content':
                content(editor, child)
                break

            case 'glossary':
                glossary(editor, child)
                break

            default:
                editor.reportError('unexpected-element', {
                    namespace: child.namespaceURI,
                    localName: child.localName,
                })
                break
            }
        }

        doc.content = editor.children
    })

    if (editor.children !== doc.content) {
        editor.reportError('normalized')
        doc.content = editor.children
    }

    return editor.finalize()
}

/**
 * Wrap a Slate editor with additional deserialization-oriented functionality
 */
function withDeserializingEditor(doc: Doc, ed: Editor): DeserializingEditor {
    const editor = ed as DeserializingEditor

    editor.deserializeElement = function deserializeElement(el, at, context) {
        if (el.namespaceURI === CNXML_NAMESPACE
        || el.namespaceURI === EDITING_NAMESPACE) {
            const deserializer = context[el.localName]

            if (deserializer != null) {
                return deserializer(editor, el, at)
            }
        }

        editor.unknownElement(el, at, context)
    }

    editor.unknownElement = function unknownElement(el, at, context) {
        if (el.namespaceURI === CNXML_NAMESPACE
        || el.namespaceURI === EDITING_NAMESPACE) {
            const deserializer = FALLBACK[el.localName]

            if (deserializer != null) {
                editor.reportError('unexpected-element', {
                    namespace: el.namespaceURI,
                    localName: el.localName,
                    id: el.getAttribute('id'),
                })
                return deserializer(editor, el, at)
            }
        }

        editor.reportError('unknown-element', {
            namespace: el.namespaceURI,
            localName: el.localName,
            id: el.getAttribute('id'),
        })
        children(editor, el, at, context)
    }

    editor.reportError = function reportError(type, description) {
        console.error(type, description)
    }

    editor.finalize = function finalize() {
        return doc
    }

    return editor
}

export type Deserializer = (editor: DeserializingEditor, el: Element, at: Path) => void

export type Deserializers = { [localName: string]: Deserializer }

/**
 * Deserialize children of an element
 *
 * This function will deserialize all child nodes of el, each into a separate
 * Slate node. This means that every XML text node will produce a Slate text
 * node, and all formatting white space will be treated as content, even for
 * block elements. This should later be fixed using {@link normalizeBlock} or
 * {@link normalizeLine}.
 */
export function children(
    editor: DeserializingEditor,
    el: Element,
    at: Path,
    context: Deserializers,
): void {
    const path = Editor.pathRef(editor, at)

    for (const child of el.childNodes) {
        switch (child.nodeType) {
        case Node.ELEMENT_NODE:
            editor.deserializeElement(child as Element, path.current!, context)
            break

        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
            editor.apply({
                type: 'insert_node',
                path: path.current!,
                node: { text: (child as CharacterData).data },
            })
            break
        case Node.PROCESSING_INSTRUCTION_NODE:
            editor.apply({
                type: 'insert_node',
                path: path.current!,
                node: {
                    type: 'processing_instruction',
                    target: (child as ProcessingInstruction).target,
                    value: (child as ProcessingInstruction).data,
                    children: [{ text: '' }],
                },
            })
            break

        // Comments, etc.
        default: break
        }
    }

    if (el.childNodes.length === 0) {
        editor.apply({ type: 'insert_node', path: path.current!, node: { text: '' } })
    }

    path.unref()
}

/**
 * Build an element according to a template and insert it at a path
 *
 * The template will be extended with additional properties common to all CNXML
 * elements.
 *
 * Element's children will be deserialized using {@link children}.
 */
export function buildElement(
    editor: DeserializingEditor,
    el: Element,
    at: Path,
    template: Partial<Slate.Element>,
    context: Deserializers,
    withChildren: boolean = true,
): void {
    const node: Slate.Element = { children: [], ...template }

    if (el.hasAttribute('id')) {
        node.id = el.getAttribute('id')
    }

    if (el.hasAttribute('class')) {
        node.classes = WithClasses.normalizeClasses([el.getAttribute('class')!])
    }

    for (const [key, value] of Object.entries(node)) {
        if (key === 'children' || key === 'text') continue

        if (value == null) {
            delete node[key]
        }
    }

    Transforms.insertNodes(editor, node, { at })
    if (withChildren) children(editor, el, [...at, 0], context)
}

/**
 * Normalize a block element after deserialization.
 *
 * All inter-element white space will be removed, and non-white space text will
 * be converted into paragraphs.
 */
export function normalizeBlock(editor: DeserializingEditor, at: Path): void {
    collapseAdjacentText(editor, at)

    for (const [node, path] of Slate.Node.children(editor, at, { reverse: true })) {
        if (!Text.isText(node)) continue

        if (/^\s*$/.test(node.text)) {
            editor.apply({ type: 'remove_node', path, node })
        } else {
            editor.reportError('text-in-block')
            Transforms.wrapNodes(editor, {
                type: 'paragraph',
                children: [],
            }, { at: path })
            normalizeWhiteSpace(editor, path)
        }
    }
}

/**
 * Normalize a line element after deserialization
 *
 * White space will be normalized (and trailing removed), and block children
 * will be unwrapped, splitting this element if necessary.
 */
export function normalizeLine(editor: Editor, at: Path): void {
    const node = Slate.Node.get(editor, at) as Slate.Element
    const hasBlocks = node.children.some(n => Slate.Element.isElement(n) && !editor.isInline(n))

    if (!hasBlocks) {
        normalizeWhiteSpace(editor, at)
    } else {
        const next = Path.next(at)
        let end = node.children.length

        for (const [inx, child] of enumerate(node.children, true)) {
            if (Text.isText(child) || editor.isInline(child)) {
                continue
            }

            if (inx + 1 < end) {
                Transforms.splitNodes(editor, { at: [...at, inx + 1] })
                normalizeWhiteSpace(editor, next)

                const newNode = Slate.Node.get(editor, next) as Slate.Element
                if (newNode.children.length === 1 && Text.isText(newNode.children[0])
                && newNode.children[0].text.match(/^\s*$/)) {
                    Transforms.removeNodes(editor, { at: next })
                }
            }

            Transforms.liftNodes(editor, { at: [...at, inx] })
            end = inx
        }

        if (end > 0) {
            normalizeWhiteSpace(editor, at)

            const newNode = Slate.Node.get(editor, at) as Slate.Element
            if (newNode.children.length === 1 && Text.isText(newNode.children[0])
            && newNode.children[0].text.match(/^\s*$/)) {
                Transforms.removeNodes(editor, { at })
            }
        }
    }
}

/** Normalize element which can contain either line content or block content */
export function normalizeMixed(editor: DeserializingEditor, at: Path) {
    const node = Slate.Node.get(editor, at)

    if (!Slate.Element.isElement(node)) {
        throw new Error(`Cannot normalize node at path [${
            JSON.stringify(at)}] as it is not an element`)
    }

    const line = node.children.every(
        (n: Slate.Node) => Text.isText(n) || Editor.isInline(editor, n))

    if (line) {
        Transforms.wrapNodes(editor, {
            type: 'paragraph',
            children: [],
        }, {
            at,
            match: n => node.children.includes(n),
        })
        normalizeLine(editor, [...at, 0])
    } else {
        normalizeBlock(editor, at)
    }
}

/** Normalize element which shouldn't contain any children */
export function normalizeVoid(editor: DeserializingEditor, at: Path): void {
    const node = Slate.Node.get(editor, at)

    if (!Slate.Element.isElement(node)) {
        throw new Error(`Cannot normalize node at path [${
            JSON.stringify(at)}] as it is not an element`)
    }

    if (node.children.length > 0) {
        normalizeWhiteSpace(editor, at)
    }

    if (node.children.length === 1
    && Text.isText(node.children[0]) && node.children[0].text === '') {
        return
    }

    if (node.children.length > 0) {
        editor.reportError('content-in-void')
    }

    const newPath = Path.next(at)
    for (let index = node.children.length - 1 ; index >= 0 ; --index) {
        editor.apply({ type: 'move_node', path: [...at, index], newPath })
    }

    editor.apply({ type: 'insert_node', path: [...at, 0], node: { text: '' } })
}

/** Build deserializer for block elements */
function block(template: string | Partial<Slate.Element>, context: Deserializers) {
    const node = typeof template === 'string'
        ? { type: template }
        : template

    return function deserializer(editor: DeserializingEditor, el: Element, at: Path) {
        buildElement(editor, el, at, node, context)
        normalizeBlock(editor, at)
    }
}

/** Build deserializer for line elements */
function line(template: string | Partial<Slate.Element>, context?: Deserializers) {
    const node = typeof template === 'string'
        ? { type: template }
        : template

    return function deserializer(editor: DeserializingEditor, el: Element, at: Path) {
        buildElement(editor, el, at, node, context ?? INLINE)
        normalizeLine(editor, at)
    }
}

/** Build deserializer for mixed elements */
function mixed(template: string | Partial<Slate.Element>, content: Deserializers) {
    const node = typeof template === 'string'
        ? { type: template }
        : template

    return function deserializer(editor: DeserializingEditor, el: Element, at: Path) {
        buildElement(editor, el, at, node, { ...INLINE, ...content })
        normalizeMixed(editor, at)
    }
}

/** --- deserialization contexts -------------------------------------------- */

/** Deserialize a <caption> */
const caption = line('caption')

/** Deserialize a <title> */
const title = line('title')

/** Inline elements */
export const INLINE: Deserializers = {
    code,
    emphasis: mark,
    footnote: line('footnote'),
    foreign,
    link,
    sub: mark,
    sup: mark,
    term,
    preformat,
}

/** Line elements */
export const LINE: Deserializers = {
    code,
    list,
    para: line('paragraph'),
    preformat,
}
LINE.quote = mixed('quotation', LINE)

/** Deserialize a <definition> */
const definition = block('definition', {
    example: block('definition_example', LINE),
    meaning: mixed('definition_meaning', LINE),
    seealso: block('definition_seealso', { term: definitionTerm }),
    term: definitionTerm,
})

/** Contents of an exercise */
const EXERCISE = {
    commentary: block('exercise_commentary', LINE),
    problem: block('exercise_problem', LINE),
    solution: block('exercise_solution', LINE),
}

/** Contents of a figure */
const FIGURE = {
    caption,
    media,
    subfigure: block('figure', { media, caption }),
    title,
}

/** Block elements */
export const BLOCK: Deserializers = {
    ...LINE,
    definition,
    exercise: block('exercise', EXERCISE),
    figure: block('figure', FIGURE),
    note,
    rule,
    table,
}

/** Content of most mixed elements */
export const MIXED = { ...LINE, ...INLINE }

/** Media items */
const MEDIA = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'alt-text': line('media_alt', {}),
    audio: mediaItem,
    image: mediaItem,
    video: mediaItem,
}

/** Contents of a rule */
const RULE = {
    example: block('rule_example', LINE),
    proof: block('rule_proof', LINE),
    statement: block('rule_statement', LINE),
    title,
}

/** Contents of a admonition */
const ADMONITION = {
    ...MIXED,
    figure: block('figure', FIGURE),
    title,
}

/** Contents of a list */
const LIST = { item }

/** Contents of a glossary */
const GLOSSARY = { definition }

/** Document content */
const CONTENT = { ...BLOCK, section }

/** Section content */
const SECTION = { ...CONTENT, title }

/** Deserializers to use when one couldn't be found in context */
const FALLBACK: Deserializers = { ...INLINE, ...SECTION, ...MEDIA }

/* --- deserializers -------------------------------------------------------- */

/** Deserialize <code> */
function code(editor: DeserializingEditor, el: Element, at: Path): void {
    buildElement(editor, el, at, {
        type: 'code',
        language: el.getAttribute('lang'),
        placement: el.getAttribute('display') === 'block' ? 'block' : 'line',
    }, INLINE)
    // NOTE: this element contains pre-formatted content and should not be
    // normalized.
}

/** Deserialize <content> */
function content(editor: DeserializingEditor, el: Element): void {
    children(editor, el, [0], CONTENT)
    normalizeBlock(editor, [])
}

/** Deserialize a <term> in <definition> */
function definitionTerm(editor: DeserializingEditor, el: Element, at: Path): void {
    buildElement(editor, el, at, {
        type: 'definition_term',
        reference: el.getAttributeNS(CMLNLE_NAMESPACE, 'reference'),
    }, INLINE)
    normalizeLine(editor, at)
}

/** Deserialize <foreign> */
function foreign(editor: DeserializingEditor, el: Element, at: Path): void {
    buildElement(editor, el, at, {
        type: 'foreign',
        language: el.getAttributeNS(XML_NAMESPACE, 'lang'),
    }, INLINE)
    normalizeLine(editor, at)
}

/** Deserialize <glossary> */
function glossary(editor: DeserializingEditor, el: Element): void {
    const path = [editor.children.length]
    buildElement(editor, el, path, { type: 'glossary' }, GLOSSARY)
    normalizeBlock(editor, path)
}

/** Deserialize a list item */
function item(editor: DeserializingEditor, el: Element, at: Path): void {
    buildElement(editor, el, at, { type: 'list_item' }, MIXED)
    normalizeMixed(editor, at)

    const node = Slate.Node.get(editor, at) as Slate.Element
    if (node.children.length === 1 && List.isList(node.children[0])) {
        Transforms.unwrapNodes(editor, { at })
    }
}

/** Deserialize a cross-reference, a document reference, or a hyperlink */
function link(editor: DeserializingEditor, el: Element, at: Path): void {
    const target = el.getAttribute('target-id')
    const document = el.getAttribute('document')
    const url = el.getAttribute('url')

    if (target != null) {
        buildElement(editor, el, at, {
            type: 'xref',
            target,
            document,
            case: el.getAttributeNS(CMLNLE_NAMESPACE, 'case'),
            children: [],
        }, {})
        normalizeVoid(editor, at)
    } else if (url != null) {
        buildElement(editor, el, at, { type: 'link', url }, INLINE)
        normalizeLine(editor, at)
    } else if (document != null) {
        buildElement(editor, el, at, {
            type: 'docref',
            document,
            case: el.getAttributeNS(CMLNLE_NAMESPACE, 'case'),
        }, INLINE)
        normalizeVoid(editor, at)
    } else {
        editor.reportError('link-missing-target')
        children(editor, el, at, INLINE)
    }
}

function list(editor: DeserializingEditor, el: Element, at: Path): void {
    const props = el.getAttribute('list-type') === 'enumerated'
        ? {
            type: 'list',
            style: 'enumerated',
            numberStyle: el.getAttribute('number-style') ?? 'arabic',
            start: Number(el.getAttribute('start-value') ?? 1),
        }
        : {
            type: 'list',
            style: 'bulleted',
            bullet: el.getAttribute('bullet') ?? 'bullet',
        }

    buildElement(editor, el, at, props, LIST)
    normalizeBlock(editor, at)
}

const MARKS: { [key: string]: Omit<StyledText, 'text'> } = {
    sub: { position: 'subscript' },
    sup: { position: 'superscript' },
    bold: { strong: true },
    underline: { underline: true },
    italics: { emphasis: true },
}

/** Deserialize a styling element */
function mark(editor: DeserializingEditor, el: Element, at: Path): void {
    const mark = el.localName === 'emphasis'
        ? el.getAttribute('effect') ?? 'bold'
        : el.localName
    const props = MARKS[mark]
    const end = Editor.pathRef(editor, at)

    children(editor, el, at, INLINE)

    if (props != null) {
        Transforms.setNodes(editor, props, {
            at: Editor.range(editor, at, Path.previous(end.current!)),
            match: Text.isText,
        })
    }

    end.unref()
}

/** Deserialize media container */
function media(editor: DeserializingEditor, el: Element, at: Path): void {
    buildElement(editor, el, at, { type: 'media' }, MEDIA)

    const node = Slate.Node.get(editor, at) as Slate.Element

    if (!node.children.some((n: Slate.Node) => n.type === 'media_alt')
    && el.hasAttribute('alt')) {
        const path = [...at, node.children.length]
        editor.apply({
            type: 'insert_node',
            path,
            node: {
                type: 'media_alt',
                children: [{ text: el.getAttribute('alt')! }],
            },
        })
        normalizeWhiteSpace(editor, path)
    }

    normalizeBlock(editor, at)
}

/** Deserialize a media item */
function mediaItem(editor: DeserializingEditor, el: Element, at: Path): void {
    const use = el.getAttribute('for')

    buildElement(editor, el, at, {
        type: 'media_' + el.localName,
        src: el.getAttribute('src'),
        intendedUse: MediaUse.isMediaUse(use) ? use : 'all',
    }, {})

    normalizeVoid(editor, at)
}

/** Deserialize an admonition */
function note(editor: DeserializingEditor, el: Element, at: Path): void {
    buildElement(editor, el, at, {
        type: 'admonition',
        kind: el.getAttribute('type') ?? 'note',
    }, ADMONITION)
    normalizeMixed(editor, at)
}

/** Deserialize <preformat> */
function preformat(editor: DeserializingEditor, el: Element, at: Path): void {
    buildElement(editor, el, at, { type: 'preformat' }, INLINE)
    // NOTE: this element contains pre-formatted content and should not be
    // normalized.
}

/** Deserialize a rule */
function rule(editor: DeserializingEditor, el: Element, at: Path): void {
    buildElement(editor, el, at, {
        type: 'rule',
        kind: el.getAttribute('type') ?? 'rule',
    }, RULE)
    normalizeBlock(editor, at)
}

/** Deserialize a <section> */
function section(editor: DeserializingEditor, el: Element, at: Path): void {
    buildElement(editor, el, at, { type: 'section' }, SECTION)
    normalizeBlock(editor, at)
}

/** Deserialize a <term> */
function term(editor: DeserializingEditor, el: Element, at: Path): void {
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
    }, INLINE)
    normalizeLine(editor, at)
}

/* --- CALS table deserializers --------------------------------------------- */

const TABLE = { title, tgroup, caption }
const TGROUP = {
    thead: theadfoot('table_header'),
    tfoot: theadfoot('table_footer'),
}

/** Deserialize a <table> */
function table(editor: DeserializingEditor, el: Element, at: Path): void {
    buildElement(editor, el, at, {
        type: 'table',
    }, TABLE)
    normalizeBlock(editor, at)
}

/** Deserialize a <tgroup> */
function tgroup(editor: DeserializingEditor, el: Element, at: Path): void {
    const cols = numericAttribute(editor, el, 'cols') ?? 1

    const columns: CNX.TableColumn[] = []
    const columnNames = new Set<string>()
    const spans: CNX.TableSpan[] = []
    const spanNames = new Set<string>()

    let header = null
    let footer = null
    let body = null

    // Pre-process children
    for (const child of el.children) {
        if (child.namespaceURI !== CNXML_NAMESPACE) {
            editor.reportError('unknown-element', {
                namespace: child.namespaceURI,
                localName: child.localName,
                id: child.getAttribute('id'),
            })
            continue
        }

        switch (child.localName) {
        case 'colspec': {
            const colname = child.getAttribute('colname') ?? null
            const colnum = numericAttribute(editor, child, 'colnum', false)

            if (colnum != null && colnum !== columns.length + 1) {
                editor.reportError('invalid-attribute', {
                    namespace: child.namespaceURI,
                    localName: child.localName,
                    id: colname,
                    attNamespace: null,
                    attName: 'colnum',
                })
            }

            if (colname != null) {
                if (columnNames.has(colname)) {
                    editor.reportError('invalid-attribute', {
                        namespace: child.namespaceURI,
                        localName: child.localName,
                        id: colname,
                        attNamespace: null,
                        attName: 'colname',
                        error: 'duplicate-name',
                    })
                } else {
                    columnNames.add(colname)
                }
            }

            columns.push({ name: colname })
            break
        }

        case 'spanspec': {
            const name = requireAttribute(editor, child, 'spanname')
            const start = setAttribute(editor, child, 'namest', columnNames)
            const end = setAttribute(editor, child, 'nameend', columnNames)

            if (name == null || start == null || end == null) break

            if (spanNames.has(name)) {
                editor.reportError('invalid-attribute', {
                    namespace: child.namespaceURI,
                    localName: child.localName,
                    id: name,
                    attNamespace: null,
                    attName: 'spanname',
                    error: 'duplicate-name',
                })
            }

            spans.push({ name, start, end })
            spanNames.add(name)

            break
        }

        // TODO: ensure only one
        case 'thead':
            header = child
            break

        // TODO: ensure only one
        case 'tfoot':
            footer = child
            break

        // TODO: ensure exactly one
        case 'tbody':
            body = child
            break

        default:
            editor.reportError('unknown-element', {
                namespace: child.namespaceURI,
                localName: child.localName,
                id: child.getAttribute('id'),
            })
            break
        }
    }

    // Infer missing columns
    while (columns.length < cols) {
        columns.push({
            name: null,
        })
    }

    // Insert group into the document
    buildElement(editor, el, at, {
        type: 'table_group',
        columns, spans,
    }, {}, false)

    // Process content
    const path = Editor.pathRef(editor, [...at, 0])

    if (header != null) {
        editor.deserializeElement(header, path.current!, TGROUP)
    }

    if (body != null) {
        tableBody(editor, body, at, path.current!)
    }

    if (footer != null) {
        editor.deserializeElement(footer, path.current!, TGROUP)
    }

    path.unref()
    normalizeBlock(editor, at)
}

/** Deserialize a <thead> or <tfoot> */
function theadfoot(type: string): Deserializer {
    return function deserializer(editor: DeserializingEditor, el: Element, at: Path): void {
        const columns = []
        const columnNames = new Set<string>()

        for (const child of el.children) {
            if (child.namespaceURI !== CNXML_NAMESPACE) {
                editor.reportError('unknown-element', {
                    namespace: child.namespaceURI,
                    localName: child.localName,
                    id: child.getAttribute('id'),
                })
                continue
            }

            switch (child.localName) {
            case 'colspec': {
                const colname = child.getAttribute('colname') ?? null
                const colnum = numericAttribute(editor, child, 'colnum', false)
                    ?? columns.length + 1

                if (colnum <= columns.length) {
                    editor.reportError('invalid-attribute', {
                        namespace: child.namespaceURI,
                        localName: child.localName,
                        id: colname,
                        attNamespace: null,
                        attName: 'colnum',
                    })
                }

                if (colname != null) {
                    if (columnNames.has(colname)) {
                        editor.reportError('invalid-attribute', {
                            namespace: child.namespaceURI,
                            localName: child.localName,
                            id: colname,
                            attNamespace: null,
                            attName: 'colname',
                            error: 'duplicate-name',
                        })
                    } else {
                        columnNames.add(colname)
                    }
                }

                while (colnum > columns.length + 1) {
                    columns.push({ name: null })
                }

                columns.push({ name: colname })
                break
            }

            case 'row': break

            default:
                editor.reportError('unknown-element', {
                    namespace: child.namespaceURI,
                    localName: child.localName,
                    id: child.getAttribute('id'),
                })
                break
            }
        }

        buildElement(editor, el, at, {
            type,
            columns: columns.length > 0 ? columns : null,
        }, {}, false)
        tableBody(editor, el, at)
    }
}

type CellInfo =
    /** Unallocated cell */
    | false
    /** Continuation of a {@code morerows} cell */
    | true

/**
 * Deserialize body of a <thead>, <tbody>, or <tfoot>
 *
 * Assumes that {@link buildElement the node was already inserted}.
 */
function tableBody(
    editor: DeserializingEditor,
    el: Element,
    at: Path,
    start: Path = [...at, 0],
): void {
    let rows = 0
    for (const child of el.children) {
        if (child.namespaceURI === CNXML_NAMESPACE && child.localName === 'row') rows += 1
    }

    const columns = Table.columns(editor, at)
    const table: CellInfo[][] = Array(rows)
        .fill(0)
        .map(() => Array<boolean>(columns.columns.length).fill(false))

    let row = 0
    const path = Editor.pathRef(editor, start)

    for (const child of el.children) {
        if (child.namespaceURI !== CNXML_NAMESPACE) {
            editor.reportError('unknown-element', {
                namespace: child.namespaceURI,
                localName: child.localName,
                id: child.getAttribute('id'),
            })
            continue
        }

        switch (child.localName) {
        case 'row':
            tableRow(editor, child, path.current!, table, row)
            row += 1
            break

        case 'colspec':
            break

        default:
            editor.reportError('unknown-element', {
                namespace: child.namespaceURI,
                localName: child.localName,
                id: child.getAttribute('id'),
            })
            break
        }
    }

    path.unref()
    normalizeBlock(editor, at)
}

function table_row(
    editor: DeserializingEditor,
    el: Element,
    at: Path,
    table: CellInfo[][],
    row: number,
): void {
    buildElement(editor, el, at, {
        type: 'table_row',
    }, {}, false)

    const columns = Table.columns(editor, at)
    const columnNames = new Set(Object.keys(columns.columnNames))
    const spanNames = new Set(Object.keys(columns.spans))
    let column = 1
    let entry = Editor.pathRef(editor, [...at, 0])

    for (const child of el.children) {
        if (child.namespaceURI !== CNXML_NAMESPACE) {
            editor.reportError('unknown-element', {
                namespace: child.namespaceURI,
                localName: child.localName,
                id: child.getAttribute('id'),
            })
            continue
        }

        let start: number
        let end: number
        let cellcolumn

        const spanname = setAttribute(editor, child, 'spanname', spanNames, false)
        const namest = setAttribute(editor, child, 'namest', columnNames, false)
        const nameend = setAttribute(editor, child, 'nameend', columnNames, false)
        const colname = setAttribute(editor, child, 'colname', columnNames, false)
        const colnameFinal = namest ?? colname
        const morerows = numericAttribute(editor, child, 'morerows', false) ?? 0

        if (row + morerows >= table.length) {
            editor.reportError('invalid-attribute', {
                namespace: child.namespaceURI,
                localName: child.localName,
                id: child.getAttribute('id'),
                attNamespace: null,
                attName: 'morerows',
            })
        }

        if (spanname != null) {
            const span = columns.spans[spanname]
            start = columns.columnNames[span.start] + 1
            end = columns.columnNames[span.end] + 1
            cellcolumn = { span: spanname }
        } else if (namest != null && nameend != null) {
            start = columns.columnNames[namest] + 1
            end = columns.columnNames[nameend] + 1
            cellcolumn = { start: namest, end: nameend }

            if (start > end) {
                editor.reportError('invalid-attribute', {
                    namespace: child.namespaceURI,
                    localName: child.localName,
                    id: child.getAttribute('id'),
                    attNamespace: null,
                    attName: 'nameend',
                })
                end = start
            }
        } else if (colnameFinal != null) {
            start = end = columns.columnNames[colnameFinal] + 1
            cellcolumn = { column: colnameFinal }
        } else /* implicit positioning */ {
            // Skip cells taken by morerows
            while (table[row][column - 1]) ++column

            start = end = column
            cellcolumn = null
        }

        // Insert implicit columns
        while (column < start) {
            if (!table[row][column - 1]) {
                Transforms.insertNodes(editor, {
                    type: 'table_cell',
                    children: [{
                        type: 'paragraph',
                        children: [{ text: '' }],
                    }],
                } as CNX.TableCell, { at: entry.current! })
                column += 1
            }
        }

        column = end + 1

        // Check conflicts
        for (let i = start ; i < end; ++i) {
            if (table[row][i - 1]) {
                editor.reportError('overlapping-cells', {
                    namespace: child.namespaceURI,
                    localName: child.localName,
                    id: child.getAttribute('id'),
                })
            }
        }

        // Mark taken rows
        for (let r = row; r <= row + morerows; ++r) {
            for (let c = start - 1; c < end; ++c)
                table[r][c] = true
        }

        switch (child.localName) {
        case 'entry': {
            const path = entry.current!
            buildElement(editor, child, path, {
                type: 'table_cell',
                column: cellcolumn,
                rows: morerows > 0 ? morerows + 1 : null,
            }, MIXED)
            normalizeMixed(editor, path)
            break
        }

        default:
            editor.reportError('unknown-element', {
                namespace: child.namespaceURI,
                localName: child.localName,
                id: child.getAttribute('id'),
            })
            break
        }
    }

    // Insert implicit trailing columns
    while (column <= columns.columns.length) {
        Transforms.insertNodes(editor, {
            type: 'table_cell',
            children: [{
                type: 'paragraph',
                children: [{ text: '' }],
            }],
        } as CNX.TableCell, { at: entry.current! })
        column += 1
    }

    entry.unref()
    normalizeBlock(editor, at)
}

/* --- utilities ------------------------------------------------------------ */

/** Get value of an attribute, reporting an error if it is missing */
function requireAttribute(
    editor: DeserializingEditor,
    el: Element,
    name: string,
): string | null {
    if (!el.hasAttribute(name)) {
        editor.reportError('missing-attribute', {
            namespace: el.namespaceURI,
            localName: el.localName,
            id: el.getAttribute('id'),
            attNamespace: null,
            attName: name,
        })
        return null
    }

    return el.getAttribute(name)
}

/**
 * Get value of an attribute, reporting an error if it is missing or not
 * a number
 */
function numericAttribute(
    editor: DeserializingEditor,
    el: Element,
    name: string,
    required: boolean = true,
): number | null {
    const repr = required
        ? requireAttribute(editor, el, name)
        : el.getAttribute(name)
    if (repr == null) return null
    const value = Number(repr)
    if (Number.isNaN(value)) {
        editor.reportError('invalid-attribute', {
            namespace: el.namespaceURI,
            localName: el.localName,
            id: el.getAttribute('id'),
            attNamespace: null,
            attName: name,
            error: 'not-a-number',
        })
        return null
    }
    return value
}

/**
 * Get value of an attribute, requiring it to be within a set of possible values
 */
function setAttribute(
    editor: DeserializingEditor,
    el: Element,
    name: string,
    values: Set<string>,
    required: boolean = true,
): string | null {
    const value = required
        ? requireAttribute(editor, el, name)
        : el.getAttribute(name)
    if (value == null) return null
    if (!values.has(value)) {
        editor.reportError('invalid-attribute', {
            namespace: el.namespaceURI,
            localName: el.localName,
            id: el.getAttribute('id'),
            attNamespace: null,
            attName: name,
            error: 'invalid-value',
            value,
            expected: Array.from(values),
        })
        return null
    }
    return value
}
