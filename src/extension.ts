import vscode from "vscode";
import Channel from 'tangle/webviews';

import TodoAppPanel from "./webview/todoApp";
import { getHtmlForWebview } from './utils';
import { webviewOptions } from './constants';

export async function activate(context: vscode.ExtensionContext) {
    const examplePanel1 = TodoAppPanel.register(context, 'panel1');
    const examplePanel2 = TodoAppPanel.register(context, 'panel2');
    const webviewPanel = vscode.window.createWebviewPanel(
        'column-one',
        'Example WebView Panel',
        vscode.ViewColumn.One,
        webviewOptions
    );
    webviewPanel.webview.html = await getHtmlForWebview(webviewPanel.webview, context.extensionUri);

    const ch = new Channel('vscode-awesome-ux');
    await ch.registerPromise([
        examplePanel1.webview,
        examplePanel2.webview,
        webviewPanel.webview
    ]);
}

// this method is called when your extension is deactivated
export function deactivate() { };
