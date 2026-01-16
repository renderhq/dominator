import type { ASTNode } from './parse.ts';

export interface Instruction {
    op: 'create' | 'attr' | 'event' | 'text' | 'expr' | 'append';
    target: string;
    args: any[];
}

export const ssa = (ast: ASTNode): Instruction[] => {
    const instructions: Instruction[] = [];
    let nextId = 0;

    const process = (node: ASTNode, parentId?: string): string => {
        const id = `v${nextId++}`;
        if (node.type === 'element') {
            instructions.push({ op: 'create', target: id, args: [node.tag] });
            if (node.props) {
                for (const [key, value] of Object.entries(node.props)) {
                    if (key.startsWith('on')) {
                        instructions.push({ op: 'event', target: id, args: [key.slice(2).toLowerCase(), value] });
                    } else {
                        instructions.push({ op: 'attr', target: id, args: [key, value] });
                    }
                }
            }
            if (node.children) {
                for (const child of node.children) {
                    const childId = process(child, id);
                    instructions.push({ op: 'append', target: id, args: [childId] });
                }
            }
        } else if (node.type === 'text') {
            instructions.push({ op: 'text', target: id, args: [node.content] });
        } else if (node.type === 'expr') {
            instructions.push({ op: 'expr', target: id, args: [node.content] });
        }
        return id;
    };

    process(ast);
    return instructions;
};
