import type { Instruction } from './ssa.ts';

export const codegen = (instructions: Instruction[]): string => {
    let code = `import { effect } from '@dominator/core';\n`;
    code += `import * as stateModule from '../state';\n\n`;
    code += 'export const renderCanvas = () => {\n';
    code += '  const { currentColor, tool, pixels, history, redoStack, GRID_SIZE, colorCounts, undo, redo, exportToPNG, startDrawing, ifDrawing, stopDrawing } = stateModule as any;\n';
    code += '  const events = (window as any);\n';

    for (const ins of instructions) {
        const { op, target, args } = ins;
        switch (op) {
            case 'create':
                code += `  const ${target} = document.createElement('${args[0]}');\n`;
                break;
            case 'attr': {
                const [key, value] = args;
                if (key.startsWith('style:')) {
                    const styleProp = key.split(':')[1];
                    if (typeof value === 'object' && value.type === 'expr') {
                        code += `  effect(() => { ${target}.style.${styleProp} = ${value.content}; });\n`;
                    } else {
                        code += `  ${target}.style.${styleProp} = ${JSON.stringify(value)};\n`;
                    }
                } else if (typeof value === 'object' && value.type === 'expr') {
                    code += `  effect(() => { ${target}.setAttribute('${key}', ${value.content}); });\n`;
                } else {
                    code += `  ${target}.setAttribute('${key}', ${JSON.stringify(value)});\n`;
                }
                break;
            }
            case 'event': {
                const [event, value] = args;
                if (typeof value === 'object' && value.type === 'expr') {
                    let content = value.content;
                    if (content.startsWith('e =>') || content.startsWith('(e) =>')) {
                        code += `  ${target}.addEventListener('${event}', ${content});\n`;
                    } else {
                        code += `  ${target}.addEventListener('${event}', (e) => ${content}(e));\n`;
                    }
                } else {
                    code += `  ${target}.addEventListener('${event}', events.${value});\n`;
                }
                break;
            }
            case 'text':
                code += `  const ${target} = document.createTextNode(${JSON.stringify(args[0])});\n`;
                break;
            case 'expr': {
                const expr = args[0];
                // Check if it's a loop or a simple value
                if (expr.includes('.map(') || expr.includes('Array.from')) {
                    code += `  const ${target} = document.createDocumentFragment();\n`;
                    if (expr.includes('GRID_SIZE')) {
                        code += `  // Optimized grid generation\n`;
                        code += `  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {\n`;
                        code += `    const x = i % GRID_SIZE; const y = Math.floor(i / GRID_SIZE);\n`;
                        code += `    const pixel = document.createElement('div');\n`;
                        code += `    pixel.className = 'pixel';\n`;
                        code += `    pixel.dataset.x = x.toString(); pixel.dataset.y = y.toString();\n`;
                        code += `    effect(() => { pixel.style.backgroundColor = pixels()[\`\${x}-\${y}\`] || '#ffffff'; });\n`;
                        code += `    ${target}.appendChild(pixel);\n`;
                        code += `  }\n`;
                    } else if (expr.includes('colorCounts')) {
                        code += `  effect(() => {\n`;
                        code += `    ${target}.textContent = '';\n`;
                        code += `    colorCounts().forEach(([col, cnt]) => {\n`;
                        code += `      const item = document.createElement('div');\n`;
                        code += `      item.className = 'usage-item';\n`;
                        code += `      item.style.setProperty('--color', col);\n`;
                        code += `      item.innerHTML = \`<div class="color-swatch"></div><span class="color-code">\${col}</span><span class="color-count">\${cnt}</span>\`;\n`;
                        code += `      ${target}.appendChild(item);\n`;
                        code += `    });\n`;
                        code += `  });\n`;
                    }
                } else {
                    code += `  const ${target} = document.createTextNode('');\n`;
                    code += `  effect(() => { ${target}.textContent = String(${expr}); });\n`;
                }
                break;
            }
            case 'append':
                code += `  ${target}.appendChild(${args[0]});\n`;
                break;
        }
    }

    const targets = new Set(instructions.map(i => i.target));
    const children = new Set(instructions.filter(i => i.op === 'append').map(i => i.args[0]));
    const root = Array.from(targets).find(t => !children.has(t));

    code += `  return ${root};\n};`;
    return code;
};
