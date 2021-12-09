import vscode from "vscode";
import { EventEmitter } from 'events';

import Channel from 'tangle/webviews';

import TodoAppPanel from "../webview/todoApp";
import { getHtmlForWebview } from '../utils';
import { webviewOptions, extensionName, cmdRingBell, cmdGetController, cmdCtrlReady, cmdActivated } from '../constants';


export default class ExtensionController implements vscode.Disposable {
    private _event: EventEmitter = new EventEmitter();
    private _disposables: vscode.Disposable[] = [];
    private _isReadyPromise = new Promise(
        (resolve) => this._event.once(cmdActivated, resolve));

    // extension webviews
    private _examplePanel1: TodoAppPanel;
    private _examplePanel2: TodoAppPanel;
    private _webviewPanel: vscode.WebviewPanel;

    /**
     * The main controller constructor
     * @constructor
     */
    constructor(private _context: vscode.ExtensionContext) {
        this._context.subscriptions.push(this);

        this._examplePanel1 = new TodoAppPanel(this._context, 'panel1');
        this._disposables.push(vscode.window.registerWebviewViewProvider('panel1', this._examplePanel1));

        this._examplePanel2 = new TodoAppPanel(this._context, 'panel2');
        this._disposables.push(vscode.window.registerWebviewViewProvider('panel2', this._examplePanel2));

        this._webviewPanel = vscode.window.createWebviewPanel(
            'column-one',
            'Example WebView Panel',
            vscode.ViewColumn.One,
            webviewOptions
        );
        this._disposables.push(this._webviewPanel);
    }

    /**
     * Deactivate the controller
     */
    deactivate(): void {
        this.dispose();
        console.log('[ExtensionController] extension deactivated');
    }

    dispose () {
        this._disposables.forEach((disposable) => disposable.dispose());
        console.log(`[ExtensionController] ${this._disposables.length} items disposed`);
    }

    /**
     * Initializes the extension
     */
    public async activate() {
        /**
         * register extension commands
         */
        this._registerCommand(cmdRingBell, async () => (await bus).emit('ring', null));
        this._registerCommand(cmdCtrlReady, () => this._isReadyPromise);
        this._registerCommand(cmdGetController, () => this);

        this._webviewPanel.webview.html = await getHtmlForWebview(
            this._webviewPanel.webview,
            this._context.extensionUri
        );

        /**
         * run this last as the `registerPromise` function resolves
         * ones all webviews got activated
         */
        const ch = new Channel<any>(extensionName);
        const bus = ch.registerPromise([
            this._examplePanel1.webview,
            this._examplePanel2.webview,
            this._webviewPanel.webview
        ]);

        this._event.emit(cmdActivated, this);
        console.log(`[ExtensionController] extension activated`);
    }

    /**
     * Helper method to setup command registrations with arguments
     */
    private _registerCommand(command: string, listener: (...args: any[]) => void): void {
        this._disposables.push(vscode.commands.registerCommand(command, (args: any) => {
            this._event.emit(command, args);
            return listener(args);
        }));
    }
}
