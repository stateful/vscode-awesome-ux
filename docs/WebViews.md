Building WebViews
=================

This is a best practices guide for building webviews in VSCode.

1. [Architecture](#architecture)
1. [Templating](#templating)
1. [Components](#components)
    1. [Adding Scripts to the Template](#adding-scripts-to-the-template)
    1. [Custom Components](#custom-components)
    1. [Shared `vscode` Instance](#shared-vscode-instance)

## Architecture

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

## Components

While VSCode allows you to write arbitrary HTML and CSS, it is recommended to align to the styleguide VSCode provides to keep the same look and feel and provide a nice integrated experience. There are several [component libraries](https://github.com/stateful/awesome-vscode-extension-utils/blob/main/README.md#component-libraries) that offer UI toolkits you can use.

### Adding Scripts to the Template

To load external scripts within your template it is recommended to apply correct content security policies. This can be done by adding a `<meta />` tag to the template that defines them, e.g.:

```html
<meta
    http-equiv="Content-Security-Policy"
    content="
        default-src 'none';
        img-src <%= it.cspSource %>;
        script-src <%= it.cspSource %>
        'nonce-<%= it.nonce %>';
        style-src 'unsafe-inline' <%= it.cspSource %>;
        style-src-elem 'unsafe-inline' <%= it.cspSource %>;
        font-src <%= it.cspSource %>;
    "
/>
```

To allow our scripts to load they need a [`nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) attribute applied to them:

```html
<script src="<%= it.script %>" nonce="<%= it.nonce %>" type="module"></script>
```

In our template function we have to pass in `cspSource`, which can be received from the webview object, and `nonce`, which can be calculated through the [`crypto`](https://nodejs.org/api/crypto.html) module:

```js
import crypto from 'crypto';
import tpl from './templates/todo.tpl.eta';

const html = await tpl({
    nonce: cspSourcecrypto.randomBytes(16).toString('base64'),
    cspSource: webview.cspSource
    script: getUri(webview, context.extensionUri, ['out', 'webview.js'])
});
```

To generate the correct Uri for the script we can use a simple helper called `getUri` which we also can use for other assets:

```ts
function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}
```

### Custom Components

If your webview doesn't contain much logic you can manage handling it within a single JavaScript file. If however you have a more complex extension with various webviews using various components it is much more scalable to build your own component library. Here you can use any frontend framework of your choice. However be aware that you don't want to cause to much performance burden to run the extension. There are simple web component based frameworks like [Lit](https://lit.dev/) that are very lightweight and allow to scale your component library.

In your entry file which you have defined in your `rollup.config.js` all you need to do is to export your components, e.g.:

```ts
export { MyComponent } from './myComponent';
```

Your custom component can be as simple as:

```ts
import {
    html,
    css,
    CSSResult,
    LitElement,
    customElement
} from 'lit';

@customElement('my-component')
export class MyComponent extends LitElement {
    static get styles(): CSSResult {
        return css/*css*/`
        p {
            font-weight: bold;
        }
        `;
    }

    render() {
        return html/* html */`
        <p>Hello World!</p>
        `;
    }
}
```

You can now use this component in your template as follows:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= it.title %></title>
</head>
<body>
    <my-component></my-component>
</body>
</html>
```

Have a look into the [Lit](https://lit.dev/docs/) documentation for more information on how to build custom components.

### Shared `vscode` Instance

To access VSCode APIs within the webview to pass messages from webview to the extension you can use [`acquireVsCodeApi`](https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-a-webview-to-an-extension). This function can only called once. In order to make use of the `vscode` instance in multiple custom components, we recommend to export it within a standalone module, e.g.:

```ts
// src/components/constants.ts
export const vscode = acquireVsCodeApi();
```

This will be bundled and executed once but can be imported by other files many times, e.g.:

```ts
// src/components/myComponent.ts
import { vscode } from './constants';
```
