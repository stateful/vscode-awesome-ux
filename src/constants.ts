export const webviewOptions = {
    enableScripts: true,
    retainContextWhenHidden: true
};

export const extensionName = 'vscode-awesome-ux';
export const cmdRingBell = 'tangle.emit';
export const cmdCtrlReady = `${extensionName}.ready`;
export const cmdActivated = `${extensionName}.activated`;
export const cmdGetController = `${extensionName}.getController`;
