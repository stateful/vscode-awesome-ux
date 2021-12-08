Initiate Extensions through an `ExtensionController`
====================================================

According to the [VSCode documentation](https://code.visualstudio.com/api/get-started/extension-anatomy#extension-entry-file) the entry file of an extension is defined in `package.json` within the `main` property. The entry file is suppose to export an `activate` and `deactivate` function which VSCode uses to initiate the extension on the desired [activation event](https://code.visualstudio.com/api/references/activation-events) or clean it up before the extension becomes deactivated.

For maintenance reasons as well as testing purposes it is recommended to write all code that initiates your extension into a class rather than directly into the `activate` method. This also us to keep the extension entry file as small as:

```ts
import vscode from "vscode";
import ExtensionController from './controller/extensionController';

let controller: ExtensionController;

export async function activate(context: vscode.ExtensionContext) {
    controller = new ExtensionController(context);
    await controller.activate();
}

/**
 * this method is called when your extension is deactivated
 */
export async function deactivate() {
    if (controller) {
        controller.deactivate();
    }
}
```

## Extension Controller

The extension controller is the brain of your extension. It should initiate your webviews, commands as well as manage logs and extension context. The basic structure of this class looks as follows:

```ts
import vscode from "vscode";
import { getExtensionLogger } from '@vscode-logging/logger';

export default class ExtensionController implements vscode.Disposable {
private _event: EventEmitter = new EventEmitter();
    private _disposables: vscode.Disposable[] = [];
    private _log = getExtensionLogger({
        extName: this._context.extension.id,
        level: 'info',
        logPath: this._context.logUri.fsPath,
        logConsole: !process.env.CI
    });

    /**
     * The main controller constructor
     * @constructor
     */
    constructor(private _context: vscode.ExtensionContext) {
        this._context.subscriptions.push(this);

        // ...
    }

    /**
     * Initializes the extension
     */
    public async activate() {
        //
    }

    /**
     * Deactivate the controller
     */
    public deactivate(): void {
        this._disposables.forEach((disposable) => disposable.dispose());
        // ...
        this._log.info('extension deactivated');
    }

    /**
     * Helper method to setup command registrations with arguments
     */
    private _registerCommand(command: string, listener: (...args: any[]) => void): void {
        this._disposables.push(
            vscode.commands.registerCommand(command, listener)
        );
    }
}
```

The main methods are:

- `async public activate()`: contains all logic that requires asynchronous execution
- `public deactivate()`: contains logic to clean up when the extension is getting deactivated
- `private _registerCommand(command, listener) => void)`: a helper method to register commands that are added to the extension context subscription

Properties defined within the controller are the following:

- `private _disposables: vscode.Disposable[]`: list of disposables that are created with the extension
- `private _log: IVSCodeExtLogger`: log instance created with [`@vscode-logging/logger`](https://www.npmjs.com/package/@vscode-logging/logger)

The extension controller is itself also an disposable object. By pushing it to the context subscription list we make sure that everything that gets created in the extension and added to `this._disposables` gets cleaned up when VSCode shuts down.
