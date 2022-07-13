import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service';
import * as locatorMap from './locators';
import { webview as webviewLocators } from './locators';
import * as locators from './locators';

export interface Webview extends IPageDecorator<typeof webviewLocators> { }
@PageDecorator(webviewLocators)
export class Webview extends BasePage<typeof webviewLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'webview' as const;

  constructor (private _frame: WebdriverIO.Element) {
    super(locators);
  }

  public async open () {
    await this._frame.waitForExist();
    await browser.switchToFrame(this._frame);
    await this.innerFrame$.waitForExist();
    const webviewInner = await browser.findElement('css selector', this.locators.innerFrame);
    await browser.switchToFrame(webviewInner);
  }

  public async close () {
    await browser.switchToFrame(null);
    await browser.switchToFrame(null);
  }

  public getRingCount () {
    return this.badge$.getText();
  }

  public ring () {
    return this.ringBtn$.click();
  }

  public toggleSyntaxHighlighting () {
    return this.syntaxEnabledCheckbox$.click();
  }

  public toggleDebugger () {
    return this.debuggerEnabledCheckbox$.click();
  }

  public toggleReplaceTabsWithSpaces ()  {
    return this.replaceTabsWithSpaces$.click();
  }
}
