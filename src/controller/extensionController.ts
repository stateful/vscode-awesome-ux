import vscode from "vscode";
import { EventEmitter } from 'events'

import Channel from 'tangle/webviews';

import TodoAppPanel from "../webview/todoApp";
import { getHtmlForWebview } from '../utils';
import { webviewOptions, tangleChannelName, cmdRingBell } from '../constants';


export default class MainController implements vscode.Disposable {
    private _event: EventEmitter = new EventEmitter();

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

        this._examplePanel1 = TodoAppPanel.register(this._context, 'panel1');
        this._examplePanel2 = TodoAppPanel.register(this._context, 'panel2');
        this._webviewPanel = vscode.window.createWebviewPanel(
            'column-one',
            'Example WebView Panel',
            vscode.ViewColumn.One,
            webviewOptions
        );
    }

    /**
     * Disposes the controller
     */
    dispose(): void {
        this.deactivate();
    }

    /**
     * Initializes the extension
     */
    public async activate() {
        this._webviewPanel.webview.html = await getHtmlForWebview(
            this._webviewPanel.webview,
            this._context.extensionUri
        );

        const ch = new Channel<any>(tangleChannelName);
        const bus = await ch.registerPromise([
            this._examplePanel1.webview,
            this._examplePanel2.webview,
            this._webviewPanel.webview
        ]);

        /**
         * register extension commands
         */
        this._registerCommandWithArgs(cmdRingBell);
        this._event.on(cmdRingBell, () => bus.emit('ring', null))
    }

    /**
     * Deactivates the extension
     */
    public async deactivate(): Promise<void> {
        console.log('extension de-activated.');
    }

    /**
     * Helper method to setup command registrations with arguments
     */
    private _registerCommandWithArgs(command: string): void {
        const self = this;
        this._context.subscriptions.push(vscode.commands.registerCommand(command, (args: any) => {
            self._event.emit(command, args);
        }));
    }
}