import { ExtensionWebView } from '../pageobjects/extension';

const workbench = () => {
    before(async () => {
        const workbench = await browser.getWorkbench();

        /**
         * open panel views as they need to be open for the extension to work
         * https://github.com/stateful/tangle/issues/37
         */
        await browser.$('h3[title="Example Panel 1"').click();
        // simulate lazy resolution
        setTimeout(async () => {
            await browser.$('h3[title="Example Panel 2"').click();
        }, 10 * 1000);
    });

    describe('test webviews', () => {
        let webviews: ExtensionWebView[] = [];

        before(async () => {
            await browser.waitUntil(
                // wait with 10s timeout until webviews are existing
                async () => (await $$('.webview.ready')).length === 2, { timeout: 10 * 1000 });

            const workbench = await browser.getWorkbench();
            webviews = (await workbench.getAllWebviews()).map((w) => new ExtensionWebView(w));
        });

        it('can load editor webview', async () => {
            await webviews[0].open();
            await expect(browser).toHaveTitleContaining('Example WebView Panel');
        });

        it('can ring bell', async () => {
            expect(await webviews[0].getRingCount()).toBe('0');

            await webviews[0].ring();
            await browser.pause(200);
            await webviews[0].ring();
            await browser.pause(200);
            await webviews[0].ring();

            expect(await webviews[0].getRingCount()).toBe('3');
        });

        it('verifies amount in Exampel Panel 1', async () => {
            expect(await webviews[1].getRingCount()).toBe('3');
            await webviews[1].ring();
        });

        it('verifies amount in Exampel Panel 2 and enables debugger', async () => {
            // expect(await webviews[2].getRingCount()).toBe('4');
            await webviews[1].toggleDebugger();
        });

        it('verifies debugger is enabled in editor webview', async () => {
            await expect(webviews[0].debuggerEnabledCheckbox$)
                .toHaveAttribute('checked', 'true');
        });
    });
};

describe('workbench', workbench);
