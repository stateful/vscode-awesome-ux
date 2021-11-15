import { readFileSync } from "fs";
import path = require("path");
import * as vscode from "vscode";
import { of, Subject, timer } from "rxjs";
import { map, take } from "rxjs/operators";
import * as Vrx from "vscoderx";
import { SyncPayload } from "./payload";

const webviewOptions = {
  enableScripts: true,
  retainContextWhenHidden: true,
};

export function activate(context: vscode.ExtensionContext) {
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

  const panelProviders: Vrx.WebviewProvider[] = [
    PanelViewProvider.register(context, "panel1"),
    PanelViewProvider.register(context, "panel2"),
    Vrx.wrapPanel(panel),
  ];

  // Subscribe to posts
  Vrx.forWebviews<SyncPayload>("vscoderx", {}, panelProviders).subscribe((bus) => {
    // Subscribe to events
    bus.listen("onPanel1", (msg) => console.log(`Listen to onPanel1: ${msg}`));
    bus.listen("onPanel1", (msg) => console.log(`Listen to onPanel2: ${msg}`));
    bus.listen("onColumn1", (msg) => console.log(`Listen to onColumn1: ${msg}`));
    // bus.onAll((msg) => console.log(`Listen to all: ${JSON.stringify(msg)}`));

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
      vscode.commands.registerCommand("vscoderx.emit", () => {
        bus.broadcast({ onCommand: "vscoderx.emit" });
      })
    );
  });
}

function getHtml(context: vscode.ExtensionContext, baseAppUri: string, identifier: string) {
  const re = /app-ext-identifier/g;
  const html = readFileSync(`${context.extensionPath}/src/webview/index.html`).toString("utf-8");
  return html.replace("app-ext-path", baseAppUri).replace(re, identifier);
}

export class PanelViewProvider implements vscode.WebviewViewProvider, Vrx.WebviewProvider {
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
