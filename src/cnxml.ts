// Copyright 2021 OpenStax Poland
// Licensed under the MIT license. See LICENSE file in the project root for
// full license text.

import { Case } from 'cnx-designer'

/** Types defining CNXML schema for JSX */
export declare namespace CNXML {
    /** Common attributes */
    namespace Attributes {
        type Display = 'block' | 'inline' | 'none'
        type MediaUse = 'default' | 'pdf' | 'online'

        interface Common {
            id: string
        }

        interface Typed {
            type?: string
        }

        interface LinkUrl {
            url: string
        }

        interface LinkDocument {
            document: string
            version?: string
        }

        interface LinkTarget extends Partial<LinkDocument> {
            'target-id': string
        }

        interface LinkResource extends Partial<LinkDocument> {
            resource: string
        }

        interface LinkWindow {
            window?: 'new' | 'replace'
        }

        type Link = (LinkUrl | LinkDocument | LinkTarget | LinkResource) & LinkWindow

        interface Strength {
            strength?: 1 | 2 | 3
        }

        interface List extends Typed {
            'list-type'?: 'bulleted' | 'enumerated' | 'labeled-item'
            'bullet-style'?: 'bullet' | 'open-circle' | 'pilcrow'
                | 'rpilcrow' | 'asterisk' | 'dash' | 'section' | 'none'
                | string
            'number-style'?: 'arabic' | 'upper-alpha' | 'lower-alpha'
                | 'upper-roman' | 'lower-roman'
            'start-value'?: number
            'mark-prefix'?: string
            'mark-suffix'?: string
            "item-sep"?: string
        }

        interface Code {
            lang?: string
        }

        interface Space {
            count?: number
            effect?: 'normal' | 'underline'
        }

        interface Media {
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
    }

    interface DisplayBlock extends Attributes.Common {
        display?: 'block' | 'none'
    }

    interface DisplayInline extends Partial<Attributes.Common> {
        display: 'inline'
    }

    type DisplayAny<T = Record<string, unknown>> = (DisplayBlock | DisplayInline) & T

    interface Audio extends Partial<Attributes.Common>, Attributes.PlayableMedia {}
    interface Caption extends Partial<Attributes.Common> {}
    type Cite = Partial<Attributes.Common> & Attributes.Link

    interface CiteTitle extends Partial<Attributes.Common> {
        'pub-type'?: 'article' | 'book' | 'booklet' | 'conference'
            | 'inbook' | 'incollection' | 'inproceedings'
            | 'mastersthesis' | 'manual' | 'misc' | 'phdthesis'
            | 'proceedings' | 'techreport' | 'unpublished'
    }

    type Code = DisplayAny<Attributes.Code>
    interface Commentary extends Attributes.Common, Attributes.Typed {}
    interface Content extends Partial<Attributes.Common> {}
    interface Definition extends Attributes.Common, Attributes.Typed {}

    interface Document extends Attributes.Common {
        'cnxml-version': '0.7' | '0.8'
        'module-id': string
        'class': string | undefined
    }

    interface Download extends Partial<Attributes.Common>, Attributes.Media {}

    interface Emphasis extends Partial<Attributes.Common> {
        effect?: 'bold' | 'italics' | 'underline' | 'smallcaps' | 'normal'
    }

    interface Equation extends Attributes.Common, Attributes.Typed {}
    interface Example extends Attributes.Common, Attributes.Typed {}

    interface Exercise extends Attributes.Common, Attributes.Typed {
        'print-placement'?: 'end' | 'here'
    }

    interface Figure extends Attributes.Common, Attributes.Typed {
        orient?: 'horizontal' | 'vertical'
    }

    interface Flash extends Partial<Attributes.Common>, Attributes.VisualMedia {
        vmode?: 'window' | 'opaque' | 'transparent'
        quality?: 'low' | 'autolow' | 'autohigh' | 'medium' | 'high'
        loop?: boolean
        scale?: 'default' | 'noorder' | 'exactfit'
        bgcolor?: string
        'flash-vars'?: string
    }

    interface Footnote extends Partial<Attributes.Common> {}
    type Foreign = Partial<Attributes.Common & Attributes.Link>
    interface Glossary extends Partial<Attributes.Common> {}

    interface Image extends Partial<Attributes.Common>, Attributes.VisualMedia {
        'print-width'?: string
        thumbnail?: string
    }

    interface Item extends Partial<Attributes.Common> {}

    interface JavaApplet extends Partial<Attributes.Common> {
        code: string
        'mime-type': string
        for?: Attributes.MediaUse
        codebase?: string
        archive?: string
        name?: string
        src?: string
        height?: number
        width?: number
        longdesc?: string
    }

    interface Label extends Partial<Attributes.Common> {}

    interface Labview extends Partial<Attributes.Common>, Attributes.VisualMedia {
        version: '7.0' | '8.0' | '8.2'
    }

    type Link = Partial<Attributes.Common> & Attributes.Link & Attributes.Strength & CMLNLE.Attributes.Cased
    type List = DisplayAny<Attributes.List>
    interface Meaning extends Attributes.Common {}

    interface Media extends Attributes.Common {
        alt: string
        display?: Attributes.Display
        longdesc?: string
    }

    interface Newline extends Partial<Attributes.Common>, Attributes.Space {}
    type Note = DisplayAny<Attributes.Typed>
    interface Para extends Attributes.Common {}

    interface Param extends Partial<Attributes.Common> {
        name: string
        value: string
    }

    interface ProcesingInstruction extends Partial<Attributes.Common> {
        target: string
        value: string
    }

    type Preformat = DisplayAny
    interface Problem extends Attributes.Common, Attributes.Typed {}
    interface Proof extends Attributes.Common, Attributes.Typed {}
    type Quote = DisplayAny<Attributes.Typed & Attributes.Link>
    interface Rule extends Attributes.Common, Attributes.Typed {}
    interface Section extends Attributes.Common, Attributes.Typed {}
    interface SeeAlso extends Partial<Attributes.Common>, Attributes.Typed {}

    interface Solution extends Attributes.Common, Attributes.Typed {
        'print-placement'?: 'end' | 'here'
    }

    interface Space extends Partial<Attributes.Common>, Attributes.Space {}
    interface Sub extends Partial<Attributes.Common> {}
    interface Subfigure extends Attributes.Common, Attributes.Typed {}
    interface Sup extends Partial<Attributes.Common> {}
    interface Statement extends Attributes.Common, Attributes.Typed {}
    type Term = Partial<Attributes.Common & Attributes.Link>
    & CMLNLE.Attributes.Reference
    & CXLXT.Attributes.NameIndex
    & CXLXT.Attributes.Index
    interface Title extends Partial<Attributes.Common> {}
    interface Video extends Partial<Attributes.Common>, Attributes.PlayableMedia, Attributes.VisualMedia {}
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
    interface AltText {}
}
