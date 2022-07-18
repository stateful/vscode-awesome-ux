import { PageDecorator, IPageDecorator, BasePage, WebView } from 'wdio-vscode-service';
import { extensionWebView as ExtensionWebViewLocators } from './locators';
import * as locatorMap from './locators';

export interface ExtensionWebView extends IPageDecorator<typeof ExtensionWebViewLocators> { }
@PageDecorator(ExtensionWebViewLocators)
export class ExtensionWebView extends BasePage<typeof ExtensionWebViewLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'extensionWebView' as const;
  private _isOpen = false;

  constructor (private _webview: WebView) {
    super(locatorMap);
  }

  private async _checkIfOpened () {
    if (!this._isOpen) {
        await this.open();
    }
  }

  public async open () {
    this._isOpen = true;
    await this._webview.close();
    return this._webview.open();
  }

  public close () {
    this._isOpen = false;
    return this._webview.close();
  }

  public async getRingCount () {
    await this._checkIfOpened();
    return this.badge$.getText();
  }

  public async ring () {
    await this._checkIfOpened();
    return this.ringBtn$.click();
  }

  public async toggleSyntaxHighlighting () {
    await this._checkIfOpened();
    return this.syntaxEnabledCheckbox$.click();
  }

  public async toggleDebugger () {
    await this._checkIfOpened();
    return this.debuggerEnabledCheckbox$.click();
  }

  public async toggleReplaceTabsWithSpaces ()  {
    await this._checkIfOpened();
    return this.replaceTabsWithSpaces$.click();
  }
}
