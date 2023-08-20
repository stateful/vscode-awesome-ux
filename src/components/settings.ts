import {
    html,
    css,
    CSSResult,
    LitElement
} from 'lit';
import { customElement } from 'lit/decorators.js';
import Channel from 'tangle/webviews';
import { Checkbox } from '@vscode/webview-ui-toolkit';
import { TelemetryReporter } from 'vscode-telemetry/webview';
import type { Client } from 'tangle';
import type { Webview } from 'vscode';

import { vscode } from './constants';
import { extensionName } from '../constants';

interface State {
    syntaxEnabled: boolean
    debuggerEnabled: boolean
    replaceTabsWithSpaces: boolean
}

const LABELS = {
    syntaxEnabled: 'Enable Syntax Highlighting',
    debuggerEnabled: 'Run with Debugger Enabled',
    replaceTabsWithSpaces: 'Replace Tabs with Spaces'
};

const reporter = TelemetryReporter.configure(vscode);

@customElement('app-settings')
export class Settings extends LitElement {
    private _client: Client<State>;
    private _state: State = {
        syntaxEnabled: false,
        debuggerEnabled: false,
        replaceTabsWithSpaces: false
    };

    static get styles(): CSSResult {
        return css/*css*/`
        vscode-radio-group {
            margin: 10px 0;
        }
        `;
    }

    constructor () {
        super();

        const channel = new Channel<State>(extensionName, this._state);
        this._client = channel.attach(vscode as any as Webview);
        this._client.listen('syntaxEnabled', (state) => (this._setState('syntaxEnabled', state)));
        this._client.listen('debuggerEnabled', (state) => (this._setState('debuggerEnabled', state)));
        this._client.listen('replaceTabsWithSpaces', (state) => (this._setState('replaceTabsWithSpaces', state)));
    }

    render() {
        return html/* html */`
        <vscode-radio-group orientation="vertical">
            <label slot="label">Editor Settings</label>

            ${Object.entries(this._state).map(([name, val]) => html/* html */`
                <vscode-checkbox id=${name} checked=${val} @change=${this._updateState}>${LABELS[name as keyof State]}</vscode-checkbox>
            `)}
        </vscode-radio-group>
        `;
    }

    private _setState (name: keyof State, state: boolean) {
        this._state[name] = state;
        this.requestUpdate();
    }

    private _updateState (ev: CustomEvent) {
        const elem = ev.composedPath()[0] as Checkbox;
        const state = elem.id as keyof typeof this._state;
        reporter.sendTelemetryEvent('checkboxChecked', { checked: elem.checked ? 'Yes' : 'no' });
        this._client.broadcast({
            ...this._state,
            ...{ [state]: elem.checked }
        });
    }
}
