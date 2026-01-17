export interface SSRInstruction {
    type: 'create' | 'attr' | 'append' | 'text';
    tag?: string;
    id: string;
    name?: string;
    value?: string;
    target?: string;
    parent?: string;
}

export const renderToString = (instructions: SSRInstruction[]) => {
    const nodes: Record<string, { tag: string; attrs: Record<string, string>; children: string[]; text?: string }> = {};
    let rootId: string | null = null;

    for (const inst of instructions) {
        if (inst.type === 'create') {
            nodes[inst.id] = { tag: inst.tag!, attrs: {}, children: [] };
            if (!rootId) rootId = inst.id;
        } else if (inst.type === 'attr') {
            if (nodes[inst.target!]) {
                nodes[inst.target!].attrs[inst.name!] = inst.value!;
            }
        } else if (inst.type === 'append') {
            if (nodes[inst.parent!] && nodes[inst.id]) {
                nodes[inst.parent!].children.push(inst.id);
            }
        } else if (inst.type === 'text') {
            nodes[inst.id] = { tag: 'text', attrs: {}, children: [], text: inst.value };
        }
    }

    const serialize = (id: string): string => {
        const node = nodes[id];
        if (node.tag === 'text') return node.text || '';

        const attrs = Object.entries(node.attrs)
            .map(([name, value]) => ` ${name}="${value}"`)
            .join('');

        const children = node.children.map(childId => serialize(childId)).join('');

        return `<${node.tag}${attrs}>${children}</${node.tag}>`;
    };

    return rootId ? serialize(rootId) : '';
};
