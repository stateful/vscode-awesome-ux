import path from "path";
import vscode from "vscode";
import { timer } from "rxjs";
import { map, take } from "rxjs/operators";
import Channel from 'tangle/webviews';
import type { WebviewProvider } from "tangle";

import TodoAppPanel from "./webview/todoApp";
import { getHtmlForWebview } from './utils';
import { webviewOptions } from './constants';

export async function activate(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'column-one',
    'Example WebView Panel',
    vscode.ViewColumn.One,
    webviewOptions
  );
  panel.webview.html = await getHtmlForWebview(panel.webview, context.extensionUri);
  
  const panelProviders: WebviewProvider[] = [
    TodoAppPanel.register(context, "panel1"),
    TodoAppPanel.register(context, "panel2"),
    // @ts-expect-error
    panel
  ];

  const ch = new Channel('vscode-awesome-ux');
  await ch.registerPromise(panelProviders);
}

// this method is called when your extension is deactivated
export function deactivate() {};
