import fs from 'fs/promises';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import eta from 'rollup-plugin-eta';

const pkg = JSON.parse((await fs.readFile('package.json')).toString());
const extensions = ['.js', '.ts'];

export default [{
    input: 'src/components/index.ts',
    output: [
        {
            file: './out/webview.js',
            format: 'esm',
            sourcemap: true,
        }
    ],
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
            declaration: false
        }),
        resolve({ extensions })
    ]
}, {
    input: 'src/index.ts',
    output: [
        {
            dir: 'out',
            format: 'cjs',
            sourcemap: true,
        }
    ],
    plugins: [
        typescript({ tsconfig: './tsconfig.json' }),
        resolve({ extensions }),
        eta()
    ],
    external: ['vscode']
}, {
    input: 'src/index.ts',
    output: [
        {
            file: './out/web.js',
            format: 'cjs',
            sourcemap: true,
            inlineDynamicImports: true
        }
    ],
    external: ['vscode'],
    plugins: [
        nodePolyfills(),
        typescript({ tsconfig: './tsconfig.json' }),
        resolve({ extensions, browser: true }),
        eta()
    ]
}];
