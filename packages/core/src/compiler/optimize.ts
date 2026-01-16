import type { Instruction } from './ssa.ts';

export const optimize = (instructions: Instruction[]): Instruction[] => {
    // Basic optimization: hoist static strings, DCE, etc.
    // For now, just return as is or do minimal cleanup.
    return instructions.filter(ins => {
        if (ins.op === 'text' && !ins.args[0]) return false;
        return true;
    });
};
