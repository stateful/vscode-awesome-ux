import { ChainablePromiseElement } from 'webdriverio';
import { ExtensionWebView } from '../pageobjects/extension';

describe('workbench', () => {
    before(async () => {
        const workbench = await browser.getWorkbench();

        /**
         * open panel views as they need to be open for the extension to work
         * https://github.com/stateful/tangle/issues/37
         */
        await browser.$('h3[title="Example Panel 1"').click();
    });

    describe('test three webviews with one lagging in resolution', () => {
        let webviews: ExtensionWebView[] = [];

        before(async () => {
            await browser.waitUntil(
                // wait until at least two webviews are existing
                async () => (await $$('.webview.ready')).length === 2);

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

        it('bring third webview (second panel) into play', async () => {
            await webviews[0].close();
            const workbench = await browser.getWorkbench();
            const examplePanel2 = await browser.$('h3[title="Example Panel 2"');
            await examplePanel2.click();
            await browser.waitUntil(
                // wait until 3 webviews are existing
                async () => (await $$('.webview.ready')).length === 3);

            webviews = (await workbench.getAllWebviews()).map((w) => new ExtensionWebView(w));
        });

        it('can ring the bell from both main and lagging webview', async ()=> {
            await webviews[0].open();
            await webviews[0].ring();
            await browser.pause(200);
            await webviews[0].ring();
            await browser.pause(200);
            await webviews[0].ring();
            await browser.pause(200);
            await webviews[2].ring();
            await browser.pause(200);

            expect(await webviews[2].getRingCount()).toBe('4');
        });

        it('verifies syntax highlighting is disabled in editor webview', async () => {
            await webviews[2].toggleSyntaxHighlighting();

            await expect(webviews[0].syntaxEnabledCheckbox$)
                .toHaveAttribute('checked', 'true');
        });
    });
});
