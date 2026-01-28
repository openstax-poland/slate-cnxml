// NOTE: you cannot use import statements in this file!

type Props<T> = Omit<T, 'type' | 'children'>
    & import('cnx-designer').ElementExtensions
    & { children: unknown }

type DefaultProps<T, O extends keyof T> = Omit<T, 'type' | 'children' | O>
    & import('cnx-designer').ElementExtensions
    & { children: unknown }
    & Partial<Pick<T, O>>

declare namespace JSX {
    interface IntrinsicElements {
        anchor: object
        cursor: object
        document: Props<import('../src').Document>
        element: Record<string, unknown>
        focus: object
        text: object

        // Elements
        audio: Props<import('cnx-designer').Audio>
        b: { children: unknown }
        caption: Props<import('cnx-designer').Caption>
        code: DefaultProps<import('cnx-designer').CodeBlock, 'placement'>
        codeline: DefaultProps<import('cnx-designer').CodeLine, 'placement'>
        defexample: Props<import('cnx-designer').DefinitionExample>
        definition: Props<import('cnx-designer').Definition>
        defmeaning: Props<import('cnx-designer').Meaning>
        defseealso: Props<import('cnx-designer').SeeAlso>
        defterm: Props<import('cnx-designer').DefinitionTerm>
        docref: Props<import('cnx-designer').DocumentReference>
        enumlist: DefaultProps<import('cnx-designer').EnumeratedList, 'style' | 'numberStyle' | 'start'>
        equation: Props<import('cnx-designer').Equation>
        excomment: Props<import('cnx-designer').Commentary>
        exercise: Props<import('cnx-designer').Exercise>
        exproblem: Props<import('cnx-designer').Problem>
        exsolution: Props<import('cnx-designer').Solution>
        figure: Props<import('cnx-designer').Figure>
        footnote: Props<import('cnx-designer').Footnote>
        foreign: Props<import('cnx-designer').Foreign>
        glossary: Props<import('cnx-designer').Glossary>
        i: { children: unknown }
        img: Props<import('cnx-designer').Image>
        itemlist: DefaultProps<import('cnx-designer').BulletedList, 'style' | 'bullet'>
        li: Props<import('cnx-designer').ListItem>
        link: Props<import('cnx-designer').Link>
        media: Props<import('cnx-designer').Media>
        mediaalt: Props<import('cnx-designer').AltText>
        nameterm: DefaultProps<import('cnx-designer').NameTerm, 'index'>
        note: DefaultProps<import('cnx-designer').Admonition, 'kind'>
        p: Props<import('cnx-designer').Paragraph>
        pi: Props<import('cnx-designer').ProcessingInstruction>
        preformat: Props<import('cnx-designer').Preformat>
        proof: Props<import('cnx-designer').Proof>
        quote: Props<import('cnx-designer').Quotation>
        rule: DefaultProps<import('cnx-designer').Rule, 'kind'>
        ruleexample: Props<import('cnx-designer').RuleExample>
        section: Props<import('cnx-designer').Section>
        statement: Props<import('cnx-designer').Statement>
        sub: { children: unknown }
        sup: { children: unknown }
        term: Props<import('cnx-designer').Term>
        title: Props<import('cnx-designer').Title>
        u: { children: unknown }
        video: Props<import('cnx-designer').Video>
        xref: DefaultProps<import('cnx-designer').CrossReference, 'document'>
    }
}
