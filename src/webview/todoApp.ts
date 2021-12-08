import {
    Webview,
    WebviewView,
    WebviewViewProvider,
    ExtensionContext
} from 'vscode';
import { Subject } from "rxjs";
import type { IVSCodeExtLogger, IChildLogger } from '@vscode-logging/logger';

import { webviewOptions } from '../constants';
import { getHtmlForWebview } from '../utils';

export default class TodoAppPanel implements WebviewViewProvider {
    private _webview = new Subject<Webview>();
    private _log: IChildLogger;

    constructor(
        private readonly _context: ExtensionContext,
        logger: IVSCodeExtLogger,
        public readonly identifier: string
    ) {
        this._log = logger.getChildLogger({ label: identifier });
    }

    async resolveWebviewView(webviewView: WebviewView): Promise<void> {
        webviewView.webview.html = await getHtmlForWebview(webviewView.webview, this._context.extensionUri);
        webviewView.webview.options = {
            ...webviewOptions,
            localResourceRoots: [this._context.extensionUri],
        };
        this._webview.next(webviewView.webview);
        this._log.info('webview resolved');
    }

    public get webview() {
        return this._webview.asObservable();
    }
}
