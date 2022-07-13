import { Webview } from '../pageobjects/webview';

describe('workbench', () => {
    before(async () => {
        const workbench = await browser.getWorkbench();

        /**
         * open panel views as they need to be open for the extension to work
         * https://github.com/stateful/tangle/issues/37
         */
        await browser.$('h3[title="Example Panel 1"').click();
        await browser.$('h3[title="Example Panel 2"').click();
        await browser.pause(1000);
    });

    describe('test webviews', () => {
        let webviews: Webview[] = [];

        before(async () => {
            const frames = await $$('.webview.ready');
            webviews = frames.map((frame) => new Webview(frame));
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
            await webviews[0].close();
        });

        it('verifies amount in Exampel Panel 1', async () => {
            await webviews[1].open();
            expect(await webviews[1].getRingCount()).toBe('3');
            await webviews[1].ring();
            await webviews[1].close();
        });

        it('verifies amount in Exampel Panel 2 and enables debugger', async () => {
            await webviews[2].open();
            expect(await webviews[2].getRingCount()).toBe('4');
            await webviews[2].toggleDebugger();
            await webviews[2].close();
        });

        it('verifies debugger is enabled in editor webview', async () => {
            await webviews[0].open();
            await expect(webviews[2].debuggerEnabledCheckbox$)
                .toHaveAttribute('checked', 'true');
            await webviews[0].close();
        });
    });
});
