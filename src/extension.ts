import fs from "fs";
import path = require("path");
import vscode from "vscode";
import { Subject, timer } from "rxjs";
import { map, take } from "rxjs/operators";
import Channel from "tangle/webviews";
import type { WebviewProvider } from "tangle";

import { SyncPayload } from "./payload";

const webviewOptions = {
  enableScripts: true,
  retainContextWhenHidden: true,
};

export async function activate(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "column-one",
    "VRX column-one",
    vscode.ViewColumn.One,
    webviewOptions
  );
  const baseAppUri = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, "/dist/webview/"))
  );
  panel.webview.html = getHtml(context, baseAppUri.toString(), "column1");

  const ch = new Channel<SyncPayload>('tangle', {});
  const bus = await ch.registerPromise([
    PanelViewProvider.register(context, "panel1"),
    PanelViewProvider.register(context, "panel2"),
    panel,
  ]);

  // Subscribe to events
  bus.listen('onPanel1', (msg) => console.log(`Listen to onPanel1: ${msg}`));
  bus.listen('onPanel1', (msg) => console.log(`Listen to onPanel2: ${msg}`));
  bus.listen('onColumn1', (msg) => console.log(`Listen to onColumn1: ${msg}`));

  // Publish posts
  const countdown = 6;
  timer(2000, 8000)
    .pipe(
      take(countdown),
      map((i) => ({ onCountdown: countdown - 1 - i }))
    )
    .subscribe((payload) => {
      bus.broadcast(payload);
    });

  context.subscriptions.push(
    vscode.commands.registerCommand("tangle.emit", () => {
      bus.broadcast({ onCommand: "tangle.emit" });
    })
  );
}

function getHtml(context: vscode.ExtensionContext, baseAppUri: string, identifier: string) {
  const re = /app-ext-identifier/g;
  const html = fs.readFileSync(`${context.extensionPath}/src/webview/index.html`).toString("utf-8");
  return html.replace("app-ext-path", baseAppUri).replace(re, identifier);
}

export class PanelViewProvider implements vscode.WebviewViewProvider, WebviewProvider {
  public view?: vscode.WebviewView;
  private _webview = new Subject<vscode.Webview>();

  constructor(
    private readonly _context: vscode.ExtensionContext,
    public readonly identifier: string
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    webviewContext: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ): void {
    this.view = webviewView;
    const basePath = path.join(this._context.extensionPath, "/dist/webview/");

    webviewView.webview.options = {
      ...webviewOptions,
      localResourceRoots: [this._context.extensionUri],
    };
    const baseAppUri = webviewView.webview.asWebviewUri(vscode.Uri.file(basePath));
    webviewView.webview.html = getHtml(this._context, baseAppUri.toString(), this.identifier);
    this._webview.next(webviewView.webview);
  }

  public static register(context: vscode.ExtensionContext, identifier: string) {
    const panelProvider = new PanelViewProvider(context, identifier);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(identifier, panelProvider)
    );
    return panelProvider;
  }

  public get webview() {
    return this._webview.asObservable();
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
