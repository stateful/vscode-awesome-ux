import {
  window,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  ExtensionContext
} from 'vscode';
import { Subject } from "rxjs";
import type { WebviewProvider } from "tangle";

import { webviewOptions } from '../constants';
import { getHtmlForWebview } from '../utils';

export default class TodoAppPanel implements WebviewViewProvider, WebviewProvider {
  private _webview = new Subject<Webview>();

  constructor(
    private readonly _context: ExtensionContext,
    public readonly identifier: string
  ) {}

  async resolveWebviewView (webviewView: WebviewView): Promise<void> {
    webviewView.webview.html = await getHtmlForWebview(webviewView.webview, this._context.extensionUri);
    webviewView.webview.options = {
      ...webviewOptions,
      localResourceRoots: [this._context.extensionUri],
    };
    this._webview.next(webviewView.webview);
  }

  public static register(context: ExtensionContext, identifier: string) {
    const panelProvider = new TodoAppPanel(context, identifier);
    context.subscriptions.push(
      window.registerWebviewViewProvider(identifier, panelProvider)
    );
    return panelProvider;
  }

  public get webview() {
    return this._webview.asObservable();
  }
}