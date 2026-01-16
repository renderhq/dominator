export interface ASTNode {
    type: 'element' | 'text' | 'expr';
    tag?: string;
    props?: Record<string, any>;
    children?: ASTNode[];
    content?: string;
}

export const parse = (template: string): ASTNode => {
    template = template.trim();
    let pos = 0;

    const parseNode = (): ASTNode => {
        if (template[pos] === '<') {
            pos++; // skip <
            let tag = '';
            while (template[pos] !== ' ' && template[pos] !== '>' && template[pos] !== '/') {
                tag += template[pos++];
            }

            const props: Record<string, any> = {};
            while (template[pos] !== '>' && template[pos] !== '/') {
                if (template[pos] === ' ') {
                    pos++;
                    continue;
                }
                let key = '';
                while (template[pos] !== '=' && template[pos] !== ' ' && template[pos] !== '>') {
                    key += template[pos++];
                }
                if (template[pos] === '=') {
                    pos++; // skip =
                    let value = '';
                    const quote = template[pos++];
                    while (template[pos] !== quote) {
                        value += template[pos++];
                    }
                    pos++; // skip quote
                    props[key] = value;
                } else {
                    props[key] = true;
                }
            }

            const isSelfClosing = template[pos] === '/';
            if (isSelfClosing) pos++;
            pos++; // skip >

            const children: ASTNode[] = [];
            if (!isSelfClosing) {
                while (pos < template.length && !(template[pos] === '<' && template[pos + 1] === '/')) {
                    if (template[pos] === '{') {
                        pos++; // skip {
                        let expr = '';
                        while (template[pos] !== '}') {
                            expr += template[pos++];
                        }
                        pos++; // skip }
                        children.push({ type: 'expr', content: expr.trim() });
                    } else if (template[pos] === '<') {
                        children.push(parseNode());
                    } else {
                        let text = '';
                        while (pos < template.length && template[pos] !== '<' && template[pos] !== '{') {
                            text += template[pos++];
                        }
                        if (text.trim()) {
                            children.push({ type: 'text', content: text.trim() });
                        }
                    }
                }
                if (pos < template.length) {
                    pos += 2; // skip </
                    while (template[pos] !== '>') pos++;
                    pos++; // skip >
                }
            }

            return { type: 'element', tag, props, children };
        }
        return { type: 'text', content: '' };
    };

    return parseNode();
};
