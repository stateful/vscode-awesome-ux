Building WebViews
=================

Webviews in VSCode can be very useful to provide users an interactive experience outside of the source code. Every webview, as panel attached to the explorer or as editor window, lives in a different environment as the extension itself, so no variables can be shared. In fact the extension runs within a Node.js environment that only supports [CommonJS](https://nodejs.org/docs/latest/api/modules.html) modules while a webview is a browser environment that can also run [ESM](https://nodejs.org/docs/latest/api/esm.html ) code. In order to leverage the modern JavaScript module system we recommend to compile the extension without your webview components as CommonJS module while webview components are bundled as EcmaScript module. If you use [Rollup](https://rollupjs.org/guide/en/) like with this example extension, this can be configured as follows:

```js
import fs from 'fs/promises';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import eta from 'rollup-plugin-eta';

const pkg = JSON.parse((await fs.readFile('package.json')).toString());
const extensions = ['.js', '.ts'];

export default [{
    /**
     * Webview components
     */
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
            declaration: false // we only need to compile *.d.ts files ones
        }),
        resolve({ extensions })
    ]
}, {
    /**
     * extension code
     */
    input: 'src/index.ts',
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
    external: ['vscode', '@vscode-logging/logger']
}
```

This generates an `out/index.js` which contains the extension code as well as an `out/webview.js` which contains our webview script which we need to add to our template.

## Templating

To avoid mixing JavaScript code with HTML we recommend to create template files that you can import and compile. There are many [template libraries](https://github.com/sindresorhus/awesome-nodejs#templating) available. In this project we use [Eta (`η`)](https://eta.js.org/) which is a lightweight, powerful, pluggable embedded JS template engine. In order to import our templates with TypeScript we recommend `rollup-plugin-eta`, e.g.:

```ts
import tpl from './templates/todo.tpl.eta';
const html = await tpl({ ... });
```

Depending which webview we want to load the HTML structure can be as simple as:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= it.title %></title>
</head>
<body>
    Hello <%= it.title %>!
</body>
</html>
```

Within your extension controller you can now create a webview as follows:

```js
const webviewPanel = vscode.window.createWebviewPanel(
    'column-one',
    'Example WebView Panel',
    vscode.ViewColumn.One,
    webviewOptions
);
this._disposables.push(webviewPanel);
webviewPanel.webview.html = await tpl({ title: 'Example WebView Panel' });
```
