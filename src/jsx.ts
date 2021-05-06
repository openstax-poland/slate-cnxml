// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import { CNXML, Editing } from './cnxml'
import { Node } from './render'

export const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'

export const XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'

export const CNXML_NAMESPACE = 'http://cnx.rice.edu/cnxml'

/** Natural language extensions to CNXML */
export const CMLNLE_NAMESPACE = 'http://katalysteducation.org/cmlnle/1.0'

export const CXLXT_NAMESPACE = 'http://katalysteducation.org/cxlxt/1.0'

/** CNXML extensions to facilitate better editing experience */
export const EDITING_NAMESPACE = 'http://adaptarr.naukosfera.com/editing/1.0'

export interface IntrinsicAttributes {
    xmlns?: string
    xmlLang?: string
    children?: Node
}

export interface IntrinsicElements {
    'cite-title': IntrinsicAttributes & CNXML.Cite
    'alt-text': IntrinsicAttributes & Editing.AltText
    audio: IntrinsicAttributes & CNXML.Audio
    caption: IntrinsicAttributes & CNXML.Caption
    cite: IntrinsicAttributes & CNXML.Cite
    code: IntrinsicAttributes & CNXML.Code
    commentary: IntrinsicAttributes & CNXML.Commentary
    content: IntrinsicAttributes & CNXML.Content
    definition: IntrinsicAttributes & CNXML.Definition
    document: IntrinsicAttributes & CNXML.Document
    download: IntrinsicAttributes & CNXML.Download
    emphasis: IntrinsicAttributes & CNXML.Emphasis
    equation: IntrinsicAttributes & CNXML.Equation
    example: IntrinsicAttributes & CNXML.Example
    exercise: IntrinsicAttributes & CNXML.Exercise
    figure: IntrinsicAttributes & CNXML.Figure
    flash: IntrinsicAttributes & CNXML.Flash
    footnote: IntrinsicAttributes & CNXML.Footnote
    foreign: IntrinsicAttributes & CNXML.Foreign
    glossary: IntrinsicAttributes & CNXML.Glossary
    image: IntrinsicAttributes & CNXML.Image
    item: IntrinsicAttributes & CNXML.Item
    'java-applet': IntrinsicAttributes & CNXML.JavaApplet
    label: IntrinsicAttributes & CNXML.Label
    labview: IntrinsicAttributes & CNXML.Labview
    link: IntrinsicAttributes & CNXML.Link
    list: IntrinsicAttributes & CNXML.List
    meaning: IntrinsicAttributes & CNXML.Meaning
    media: IntrinsicAttributes & CNXML.Media
    newline: IntrinsicAttributes & CNXML.Newline
    note: IntrinsicAttributes & CNXML.Note
    para: IntrinsicAttributes & CNXML.Para
    param: IntrinsicAttributes & CNXML.Param
    pi: IntrinsicAttributes & CNXML.ProcesingInstruction
    preformat: IntrinsicAttributes & CNXML.Preformat
    problem: IntrinsicAttributes & CNXML.Problem
    proof: IntrinsicAttributes & CNXML.Proof
    quote: IntrinsicAttributes & CNXML.Quote
    rule: IntrinsicAttributes & CNXML.Rule
    section: IntrinsicAttributes & CNXML.Section
    seealso: IntrinsicAttributes & CNXML.SeeAlso
    solution: IntrinsicAttributes & CNXML.Solution
    space: IntrinsicAttributes & CNXML.Space
    statement: IntrinsicAttributes & CNXML.Statement
    sub: IntrinsicAttributes & CNXML.Sub
    subfigure: IntrinsicAttributes & CNXML.Subfigure
    sup: IntrinsicAttributes & CNXML.Sup
    term: IntrinsicAttributes & CNXML.Term
    title: IntrinsicAttributes & CNXML.Title
    video: IntrinsicAttributes & CNXML.Video
}
