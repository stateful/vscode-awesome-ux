export const webviewOptions = {
    enableScripts: true,
    retainContextWhenHidden: true
};

export const tangleChannelName = 'vscode-awesome-ux';
export const cmdRingBell = 'tangle.emit';
export const cmdCtrlReady = `${tangleChannelName}.ready`;
export const cmdActivated = `${tangleChannelName}.activated`;
export const cmdGetController = `${tangleChannelName}.getController`;
