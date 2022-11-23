import { ExtensionWebView } from '../pageobjects/extension';

describe('test webviews', () => {
    let webviews: ExtensionWebView[] = [];

    before(async () => {
        const workbench = await browser.getWorkbench();
        const editor = await workbench.getEditorView();

        await browser.waitUntil(async () => {
            const tabs = await editor.getOpenTabs();

            for (const tab of tabs) {
                const tabTitle = await tab.getTitle();
                if (tabTitle.includes('Example WebView Panel')) {
                    await tab.select();
                    return true;
                }
            }
            return false;
        });
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

        await browser.pause(300);
        expect(await webviews[0].getRingCount()).toBe('3');
        await webviews[0].close();
    });

    it('verifies amount in Exampel Panel 1', async () => {
        const workbench = await browser.getWorkbench();
        await browser.$('h3[title="Example Panel 1"').click();
        await browser.waitUntil(async () => (await workbench.getAllWebviews()).length === 2);
        webviews = (await workbench.getAllWebviews()).map((w) => new ExtensionWebView(w));
        await webviews[1].open();
        expect(await webviews[1].getRingCount()).toBe('0');
        await webviews[1].ring();
        await browser.pause(1000);
        expect(await webviews[1].getRingCount()).toBe('1');
        await webviews[1].close();
    });

    it('verifies amount in Exampel Panel 2 and enables debugger', async () => {
        const workbench = await browser.getWorkbench();
        await browser.$('h3[title="Example Panel 2"').click();
        await browser.waitUntil(async () => (await workbench.getAllWebviews()).length === 3);
        webviews = (await workbench.getAllWebviews()).map((w) => new ExtensionWebView(w));
        await webviews[2].open();
        expect(await webviews[2].getRingCount()).toBe('0');
        await webviews[2].ring();
        await browser.pause(1000);
        expect(await webviews[2].getRingCount()).toBe('1');
        await webviews[2].toggleDebugger();
    });

    it('verifies debugger is enabled in editor webview', async () => {
        await expect(webviews[2].debuggerEnabledCheckbox$)
            .toHaveAttribute('checked', 'true');
    });
});
