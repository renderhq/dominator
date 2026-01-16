import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@dominator/core': path.resolve(__dirname, '../core/src/index.ts')
        }
    }
});
