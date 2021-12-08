import type { ExtensionConfiguration } from '../types';

export const vscode = acquireVsCodeApi();

const configDataProperty = 'data-extension-configuration';
export const config: ExtensionConfiguration = JSON.parse(
    document.querySelector(`meta[${configDataProperty}]`)?.getAttribute(configDataProperty) as string
);
