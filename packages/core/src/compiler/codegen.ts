import type { Instruction } from './ssa.ts';

export const codegen = (instructions: Instruction[]): string => {
    let code = `import { effect } from '@dominator/core';\n`;
    code += `import * as stateModule from '../state';\n\n`;
    code += 'export const renderCanvas = () => {\n';
    code += '  const { currentColor, tool, pixels, history, redoStack, GRID_SIZE, colorCounts, undo, redo, exportToPNG, startDrawing, ifDrawing, stopDrawing } = stateModule as any;\n';
    code += '  const events = (window as any);\n';


    const generateBlock = (instrs: Instruction[]): string => {
        let blockCode = '';
        for (const ins of instrs) {
            const { op, target, args, nested } = ins;
            switch (op) {
                case 'create':
                    blockCode += `  const ${target} = document.createElement('${args[0]}');\n`;
                    break;
                case 'attr': {
                    const [key, value] = args;
                    if (key.startsWith('style:')) {
                        const styleProp = key.split(':')[1];
                        if (typeof value === 'object' && value.type === 'expr') { // Legacy parser check, parser.ts emits string for value? No, AST is different.
                            // logic for style binding
                            blockCode += `  effect(() => { ${target}.style.${styleProp} = ${value}; });\n`;
                        } else {
                            // Check if value is a string that looks like binding? 
                            // In new parser, expression is usually separate AST node.
                            // But attributes can have values. in parser.ts: attributes[attr.name] = attr.value
                            // if it's dynamic, value is `{expr}` string.
                            // We need to strip curlies if present.
                            if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                                const expr = value.slice(1, -1);
                                blockCode += `  effect(() => { ${target}.style.${styleProp} = ${expr}; });\n`;
                            } else {
                                blockCode += `  ${target}.style.${styleProp} = ${JSON.stringify(value)};\n`;
                            }
                        }
                    } else {
                        // Attribute
                        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                            const expr = value.slice(1, -1);
                            blockCode += `  effect(() => { ${target}.setAttribute('${key}', ${expr}); });\n`;
                        } else {
                            blockCode += `  ${target}.setAttribute('${key}', ${JSON.stringify(value)});\n`;
                        }
                    }
                    break;
                }
                case 'event': {
                    const [event, value] = args;
                    // value might be string or binding
                    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                        const handler = value.slice(1, -1);
                        blockCode += `  ${target}.addEventListener('${event}', ${handler});\n`;
                    } else {
                        blockCode += `  ${target}.addEventListener('${event}', events.${value});\n`;
                    }
                    break;
                }
                case 'text':
                    blockCode += `  const ${target} = document.createTextNode(${JSON.stringify(args[0])});\n`;
                    break;
                case 'expr': {
                    const expr = args[0];
                    blockCode += `  const ${target} = document.createTextNode('');\n`;
                    blockCode += `  effect(() => { ${target}.textContent = String(${expr}); });\n`;
                    break;
                }
                case 'append':
                    blockCode += `  ${target}.appendChild(${args[0]});\n`;
                    break;
                case 'each': {
                    const [source, context] = args;
                    // Generate a fragment/anchor
                    blockCode += `  const ${target} = document.createDocumentFragment();\n`;
                    blockCode += `  effect(() => {\n`;
                    blockCode += `      ${target}.textContent = ''; // Clear for simple re-render (naive)\n`;
                    blockCode += `      (${source} || []).forEach((${context}) => {\n`;
                    // Generate nested code
                    if (nested) {
                        blockCode += generateBlock(nested);
                        // We need to know which node is the root of the nested block to append it.
                        // But 'nested' is a list of instructions.
                        // We need to find the root node(s) of the nested block.
                        // Simple heuristic: nodes that are not appended to anything?
                        // Or just look at the last returned ID from serialize?
                        // In ssa.ts serialize returns 'lastId'.
                        // But here we rely on the instructions themselves.
                        // Let's assume the nested block creates a root and the last instructions might be appending or returning.
                        // Naive approach: Find nodes created in 'nested' that are not appended to other nodes in 'nested'.
                        const created = new Set(nested.filter(i => ['create', 'text', 'expr', 'each'].includes(i.op)).map(i => i.target));
                        const appended = new Set(nested.filter(i => i.op === 'append').map(i => i.args[0]));
                        const roots = Array.from(created).filter(t => !appended.has(t));

                        roots.forEach(r => {
                            blockCode += `        ${target}.appendChild(${r});\n`;
                        });
                    }
                    blockCode += `      });\n`;
                    blockCode += `  });\n`;
                    break;
                }
            }
        }
        return blockCode;
    };

    code += generateBlock(instructions);

    const targets = new Set(instructions.map(i => i.target));
    const children = new Set(instructions.filter(i => i.op === 'append').map(i => i.args[0]));
    // For root, we only consider top-level instructions
    const root = Array.from(targets).find(t => !children.has(t));


    code += `  return ${root};\n};`;
    return code;
};
