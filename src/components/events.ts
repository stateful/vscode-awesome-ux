import Channel from 'tangle/webviews';
import { Client } from 'tangle';
import {
    css,
    html,
    CSSResult,
    LitElement,
    customElement
} from 'lit-element';

import { vscode, config } from './constants';
import { extensionName } from '../constants';

interface TangleEvents {
    ring?: boolean
}

@customElement('app-events')
export class Events extends LitElement {
    private _notifications = config.defaultNotifications;
    private _client: Client<TangleEvents>;

    static get styles(): CSSResult {
        return css/*css*/`
        ::slotted(i) {
            display: inline-block!important;
            position: relative;
            top: 3px;
            padding: 0 3px;
        }

        :host > div {
            margin: 10px 0;
        }

        :host > div > vscode-tag {
            opacity: 0;
            transition-property: opacity;
            transition-duration: 0.5s;
        }

        :host > div > vscode-tag.on {
            opacity: 1;
            transition-duration: 0s;
        }

        :host > div > vscode-button {
            display: block;
            width: 80px;
            margin-top: 10px;
        }`;
    }

    constructor () {
        super();

        const channel = new Channel<TangleEvents>(extensionName);
        this._client = channel.attach(vscode);
        this._client.on('ring', () => {
            ++this._notifications;
            this.requestUpdate();

            const bell = this.shadowRoot?.querySelector('vscode-tag');
            bell?.setAttribute('class', 'on');
            setTimeout(() => bell?.removeAttribute('class'), 100);
        });
    }

    render() {
        return html/* html */`
        <div>
            <vscode-badge>${this._notifications}</vscode-badge>
            <slot></slot>
            <vscode-tag>Bell Ringed!</vscode-tag>
            <vscode-button @click="${this._ringBell}">Ring Bell</vscode-button>
        </div>
        `;
    }

    private _ringBell() {
        this._client.emit('ring', true);
    }
}
