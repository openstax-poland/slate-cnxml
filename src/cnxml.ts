// Copyright 2026 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

/* eslint-disable @typescript-eslint/naming-convention */

import { Bullet, Case, MediaUse, NumberStyle } from 'cnx-designer'

import { CNXML_NAMESPACE, EDITING_NAMESPACE } from './consts'

/** Types defining CNXML schema for JSX */
export declare namespace CNXML {
    namespace Attributes {

        interface Namespace {
            xmlns: typeof CNXML_NAMESPACE
        }

        interface Common extends Namespace {
            class?: string
        }

        interface Typed {
            type?: string
        }

        interface UrlLink {
            url: string
        }

        interface VersionLink {
            version: string
        }

        interface DocumentLink extends Partial<VersionLink> {
            document: string
        }

        type LinkTargetResourceOrId =
            | { 'target-id': string }
            | { resource: string }

        interface LinkWindow {
            window?: 'new' | 'replace'
        }

        type Link = LinkWindow & (
            | UrlLink
            | ((VersionLink | DocumentLink) & Partial<LinkTargetResourceOrId>)
            | LinkTargetResourceOrId
        )

        type Linking = LinkWindow & (UrlLink | (Partial<DocumentLink> & LinkTargetResourceOrId))

        interface Strength {
            strength?: 1 | 2 | 3
        }

        interface List extends Attributes.Common, Display {
            'mark-prefix'?: string
            id: string
            'item-sep'?: string
        }

        interface BulletedList extends List {
            'list-type'?: 'bulleted'
            'mark-suffix'?: string
            'bullet-style'?: Bullet
        }

        interface EnumeratedList extends List {
            'mark-suffix'?: string
            'list-type': 'enumerated'
            'number-style'?: NumberStyle
            'start-value'?: number
        }

        interface LabelledList extends List {
            'mark-suffix'?: string
            'list-type': 'labeled-list'
        }

        interface Space {
            count?: number
            effect?: string
        }

        interface Media extends Common {
            id?: string
            src: string
            'mime-type': string
            for?: MediaUse
            longdesc?: string
        }

        interface PlayableMedia extends Media {
            standby?: string
            autoplay?: boolean
            loop?: boolean
            controller?: boolean
            volume?: number
        }

        interface VisualMedia extends Media {
            height?: number
            width?: number
        }

        interface Display {
            display?: 'none' | 'inline' | 'block'
        }

        interface PrintPlacement {
            'print-placement'?: 'here' | 'end'
        }
    }

    type Audio = Attributes.Namespace & Attributes.PlayableMedia
    type Caption = Attributes.Namespace
    type Cite = Attributes.Namespace & Attributes.Linking

    interface CiteTitle extends Attributes.Namespace {
        'pub-type'?: 'article' | 'book' | 'booklet' | 'conference'
            | 'inbook' | 'incollection' | 'inproceedings'
            | 'mastersthesis' | 'manual' | 'misc' | 'phdthesis'
            | 'proceedings' | 'techreport' | 'unpublished'
    }

    interface Code extends Attributes.Common, Attributes.Display, Attributes.Typed {
        lang?: string
        id: string
    }

    interface Commentary extends Attributes.Common, Attributes.Typed {
        id: string
    }

    interface Content extends Attributes.Common {
        id?: string
    }

    interface Definition extends Attributes.Common, Attributes.Typed {
        id: string
    }

    interface Div extends Attributes.Common {
        id: string
    }

    interface Document extends Attributes.Common {
        id: string
        'cnxml-version': '0.7' | '0.8'
        'module-id'?: string
        class?: string
    }

    interface Download extends Attributes.Namespace, Attributes.Media {}

    interface Emphasis extends Attributes.Namespace {
        effect?: 'bold' | 'italics' | 'underline' | 'smallcaps' | 'normal'
    }

    interface Equation extends Attributes.Common, Attributes.Typed {
        id: string
    }

    type Example = Attributes.Namespace

    interface Exercise extends Attributes.Common, Attributes.Typed, Attributes.PrintPlacement {
        id: string
    }

    interface Figure extends Attributes.Common, Attributes.Typed {
        id: string
        orient?: 'horizontal' | 'vertical'
    }

    interface Flash extends Attributes.Namespace, Attributes.Media {
        vmode?: 'window' | 'opaque' | 'transparent'
        quality?: 'low' | 'autolow' | 'autohigh' | 'medium' | 'high'
        loop?: boolean
        scale?: 'default' | 'noorder' | 'exactfit'
        bgcolor?: string
        'flash-vars'?: string
    }

    interface Footnote extends Attributes.Common {
        id: string
    }

    type Foreign = Attributes.Namespace & Partial<Attributes.Linking>

    interface Glossary extends Attributes.Common {
        id?: string
    }

    interface Iframe extends Attributes.Namespace {
        src: string
        id?: string
        height?: number
        width?: number
    }

    interface Image extends Attributes.VisualMedia {
        'print-width'?: string
        thumbnail?: string
    }

    interface Item extends Attributes.Common {
        id?: string
    }

    interface JavaApplet extends Attributes.Common {
        id?: string
        code: string
        'mime-type': string
        for?: MediaUse
        codebase?: string
        archive?: string
        name?: string
        src?: string
        height?: number
        width?: number
        longdesc?: string
    }

    type Label = Attributes.Namespace

    interface Labview extends Attributes.VisualMedia {
        viname?: string
        version: '7.0' | '8.0' | '8.2'
    }

    type Link = Attributes.Namespace
    & Attributes.Link
    & Attributes.Strength
    & CMLNLE.Attributes.Cased

    type List = Attributes.BulletedList | Attributes.EnumeratedList | Attributes.LabelledList

    interface LongDescription extends Attributes.Common {
        id?: string
    }

    interface Meaning extends Attributes.Common {
        id: string
    }

    interface Media extends Attributes.Common, Attributes.Display {
        id: string
        alt: string
        longdesc?: string
    }

    interface Newline extends Attributes.Common, Attributes.Space {
        id?: string
    }

    interface Note extends Attributes.Common, Attributes.Typed, Attributes.Display {
        id: string
    }

    type Object = Attributes.Media

    interface Para extends Attributes.Common {
        id: string
    }

    interface Param extends Attributes.Common {
        id?: string
        name: string
        value: string
    }

    interface Preformat extends Attributes.Common, Attributes.Display {
        id?: string
    }

    type Problem = Attributes.Namespace
    type Proof = Attributes.Namespace

    type Quote = Attributes.Common
    & Attributes.Display
    & Attributes.Typed
    & Partial<Attributes.Linking>
    & { id?: string }

    interface Rule extends Attributes.Common, Attributes.Typed {
        id: string
    }

    type Section = Attributes.Namespace

    interface SeeAlso extends Attributes.Common, Attributes.Typed {
        id?: string
    }

    interface Solution extends Attributes.Namespace, Attributes.PrintPlacement {}

    interface Space extends Attributes.Common, Attributes.Space {
        id?: string
    }

    interface Span extends Attributes.Namespace {
        effect?: string
    }

    type Sub = Attributes.Namespace

    interface Subfigure extends Attributes.Common, Attributes.Typed {
        id: string
    }

    type Sup = Attributes.Namespace

    type Statement = Attributes.Namespace

    type Term = Attributes.Namespace
    & Partial<Attributes.Linking>
    & CMLNLE.Attributes.Reference
    & CXLXT.Attributes.NameIndex
    & CXLXT.Attributes.Index

    interface Text extends Attributes.Media {
        id?: string
    }

    interface Title extends Attributes.Common {
            id?: string
    }

    type Video = Attributes.Namespace & Attributes.PlayableMedia
}

/** Natural language extensions to CNXML */
export declare namespace CMLNLE {
    namespace Attributes {
        interface Cased {
            cmlnleCase?: Case
        }

        interface Reference {
            cmlnleReference?: string
        }
    }
}

export declare namespace CXLXT {
    namespace Attributes {
        interface Index {
            cxlxtIndex?: string
        }

        interface NameIndex {
            cxlxtBorn?: number
            cxlxtDied?: number
            cxlxtName?: string
        }
    }
}

/** CNXML extensions to facilitate better editing experience */
export declare namespace Editing {
    namespace Attributes {
        interface Common {
            xmlns: typeof EDITING_NAMESPACE
        }
    }

    interface AltText extends Attributes.Common {}
}
