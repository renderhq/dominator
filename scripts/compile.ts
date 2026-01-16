import fs from 'node:fs';
import path from 'node:path';
import { parse } from '../packages/core/src/compiler/parse.ts';
import { ssa } from '../packages/core/src/compiler/ssa.ts';
import { optimize } from '../packages/core/src/compiler/optimize.ts';
import { codegen } from '../packages/core/src/compiler/codegen.ts';

const compile = (inputFile: string, outputFile: string) => {
    const template = fs.readFileSync(inputFile, 'utf-8');
    const ast = parse(template);
    const instructions = ssa(ast);
    const optimized = optimize(instructions);
    const code = codegen(optimized);

    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputFile, code);
    console.log(`Compiled ${inputFile} -> ${outputFile}`);
};

// Example usage strictly for the todo example as per requirements
const todoTemplate = path.join(process.cwd(), 'packages/todo-example/src/templates/todo-list.dnr');
const todoOutput = path.join(process.cwd(), 'packages/todo-example/src/generated/todo-render.ts');

if (fs.existsSync(todoTemplate)) {
    compile(todoTemplate, todoOutput);
} else {
    console.error(`Template not found: ${todoTemplate}`);
}
