import { parse } from './parse.ts';
import { ssa } from './ssa.ts';
import { optimize } from './optimize.ts';
import { codegen } from './codegen.ts';

export function dominatorPlugin() {
    return {
        name: 'vite-plugin-dominator',
        transform(code: string, id: string) {
            if (id.endsWith('.dnr')) {
                const ast = parse(code);
                const instructions = ssa(ast);
                const optimized = optimize(instructions);
                const result = codegen(optimized);

                return {
                    code: result,
                    map: null // TODO: Source maps
                };
            }
        }
    };
}
