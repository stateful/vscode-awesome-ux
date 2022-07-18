import { Uri, Webview, window, workspace } from "vscode";
import { extensionName } from './constants';

// @ts-expect-error
import tpl from './templates/todo.tpl.eta';

const config = workspace.getConfiguration(extensionName);

function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

function generateRandomString (myLength = 20) {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const randomArray = Array.from(
        { length: myLength },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );

    const randomString = randomArray.join('');
    return randomString;
}

export async function getHtmlForWebview(webview: Webview, extensionUri: Uri) {
    const { cspSource } = webview;
    const scripts = [{
        src: getUri(webview, extensionUri, [
            'node_modules',
            '@vscode',
            'webview-ui-toolkit',
            'dist',
            'toolkit.js'
        ]),
        defer: true
    }, {
        src: getUri(webview, extensionUri, ['out', 'webview.js']),
        defer: true
    }];
    const stylesheets = [{
        id: 'vscode-codicon-stylesheet',
        href: getUri(webview, extensionUri, ['node_modules', '@vscode', 'codicons', 'dist', 'codicon.css'])
    }];

    try {
        const html = await tpl({
            scripts, stylesheets, cspSource,
            nonce: btoa(generateRandomString()),
            config: config.get('configuration'),
            title: 'VSCode Awesome UX',
            rootElem: 'todo-app'
        });
        return html!;
    } catch (err: any) {
        window.showErrorMessage(`Couldn't generate template: ${err.message}`);
        return '';
    }
}
