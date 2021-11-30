import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import eta from 'rollup-plugin-eta';

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
    ]
}];