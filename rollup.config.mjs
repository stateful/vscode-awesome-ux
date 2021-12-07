import fs from 'fs/promises';
import multiInput from 'rollup-plugin-multi-input';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import eta from 'rollup-plugin-eta';

const pkg = JSON.parse((await fs.readFile('package.json')).toString());
const extensions = ['.js', '.ts'];

export default [{
    input: 'src/components/index.ts',
    output: [
        {
            file: './out/webview.js',
            format: 'esm'
        },
    ],
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
            declaration: false
        }),
        resolve({ extensions })
    ]
}, {
    input: 'src/extension.ts',
    output: [
        {
            dir: 'out',
            format: 'cjs'
        },
    ],
    plugins: [
        typescript({ tsconfig: './tsconfig.json' }),
        resolve({ extensions }),
        eta()
    ],
    external: ['vscode']
}, {
    input: ['src/tests/**/*'],
    output: [
        {
            dir: 'out',
            format: 'cjs'
        },
    ],
    plugins: [
        multiInput.default(),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: false
        }),
        eta()
    ],
    external: [
        'assert',
        'path',
        'util',
        'events',
        'fs/promises',
        'vscode',
        'tangle/webviews',
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.devDependencies)
    ]
}];
