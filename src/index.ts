import vscode from "vscode";
import { TelemetryReporter } from 'vscode-telemetry';

import ExtensionController from './controller/extension';
import { cmdCtrlReady, cmdGetController } from './constants';

export async function activate(context: vscode.ExtensionContext) {
    TelemetryReporter.configure(context, '66346d45-9df3-4d44-bd46-f3c9e01071ce');
    TelemetryReporter.sendTelemetryEvent('ExtensionActivated');
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
    await vscode.commands.executeCommand(cmdCtrlReady);
    return vscode.commands.executeCommand(cmdGetController);
}
