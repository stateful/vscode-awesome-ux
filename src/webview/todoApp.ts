import {
    Webview,
    WebviewView,
    WebviewViewProvider,
    ExtensionContext
} from 'vscode';
import { Subject } from "rxjs";
import { TelemetryViewProvider } from 'vscode-telemetry';

import { webviewOptions } from '../constants';
import { getHtmlForWebview } from '../utils';

export default class TodoAppPanel extends TelemetryViewProvider implements WebviewViewProvider {
    private _webview = new Subject<Webview>();

    constructor(
        private readonly _context: ExtensionContext,
        public readonly identifier: string
    ) {
        super();
    }

    async resolveWebviewTelemetryView(webviewView: WebviewView): Promise<void> {
        webviewView.webview.html = await getHtmlForWebview(webviewView.webview, this._context.extensionUri);
        webviewView.webview.options = {
            ...webviewOptions,
            localResourceRoots: [this._context.extensionUri],
        };
        this._webview.next(webviewView.webview);
        console.log('[TodoAppPanel] webview resolved');
    }

    public get webview() {
        return this._webview.asObservable();
    }
}
