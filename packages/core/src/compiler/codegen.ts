import type { Instruction } from './ssa.ts';

export const codegen = (instructions: Instruction[]): string => {
    let code = 'export const render = (state, events) => {\n';

    for (const ins of instructions) {
        const { op, target, args } = ins;
        switch (op) {
            case 'create':
                code += `  const ${target} = document.createElement('${args[0]}');\n`;
                break;
            case 'attr':
                code += `  ${target}.setAttribute('${args[0]}', ${JSON.stringify(args[1])});\n`;
                break;
            case 'event':
                // Handle expressions in events
                const eventVal = args[1].startsWith('{') && args[1].endsWith('}')
                    ? args[1].slice(1, -1)
                    : `events.${args[1]}`;
                code += `  ${target}.addEventListener('${args[0]}', (e) => ${eventVal}(e));\n`;
                break;
            case 'text':
                code += `  const ${target} = document.createTextNode('${args[0]}');\n`;
                break;
            case 'expr':
                code += `  const ${target} = document.createElement('span');\n`;
                code += `  ${target}.innerHTML = state.${args[0]};\n`;
                break;
            case 'append':
                code += `  ${target}.appendChild(${args[0]});\n`;
                break;
        }
    }

    // The last instruction's target is the root
    const rootId = instructions[instructions.length - 1]?.target || 'null';
    if (rootId.startsWith('v')) {
        // Find the first instruction's target if it's the root of a tree
        // Actually, a better way is to track the root of the process in ssa and pass it.
        // For this simple example, the last 'v' that was appended to nothing is likely the root.
        // Let's just assume the first 'create' that has no append targeting it is the root.
        // Simpler: SSA should return the root ID.
    }

    // For simplicity, let's find the instruction that isn't an arg in any 'append' op.
    const targets = new Set(instructions.map(i => i.target));
    const children = new Set(instructions.filter(i => i.op === 'append').map(i => i.args[0]));
    const root = Array.from(targets).find(t => !children.has(t));

    code += `  return ${root};\n};`;
    return code;
};
