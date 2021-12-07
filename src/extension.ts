import vscode from "vscode";
import ExtensionController from './controller/extensionController';
import { cmdGetController } from './constants';

export async function activate(context: vscode.ExtensionContext) {
    const controller = new ExtensionController(context);
    await controller.activate();
}

/**
 * this method is called when your extension is deactivated
 */
export async function deactivate() {
    const controller = await getController();
    controller!.deactivate();
}

/**
 * Exposed for testing purposes
 */
export async function getController(): Promise<ExtensionController | undefined> {
    return vscode.commands.executeCommand(cmdGetController);
}
