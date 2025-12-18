import { Page, Locator } from '@playwright/test';

/**
 * Base page object class with common functionality
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a URL
   */
  async goto(url: string) {
    await this.page.goto(url);
  }

  /**
   * Wait for page to be ready
   */
  async waitForReady() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get element by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * Get element by role
   */
  getByRole(role: string, options?: { name?: string | RegExp }): Locator {
    return this.page.getByRole(role as any, options);
  }

  /**
   * Get element by text
   */
  getByText(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get element by placeholder
   */
  getByPlaceholder(text: string | RegExp): Locator {
    return this.page.getByPlaceholder(text);
  }

  /**
   * Get element by label
   */
  getByLabel(text: string | RegExp): Locator {
    return this.page.getByLabel(text);
  }

  /**
   * Click and wait for navigation
   */
  async clickAndWaitForNavigation(selector: string) {
    await Promise.all([
      this.page.waitForNavigation(),
      this.page.click(selector),
    ]);
  }

  /**
   * Fill form field
   */
  async fillField(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  /**
   * Select dropdown option
   */
  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  /**
   * Check checkbox
   */
  async check(selector: string) {
    await this.page.check(selector);
  }

  /**
   * Uncheck checkbox
   */
  async uncheck(selector: string) {
    await this.page.uncheck(selector);
  }

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string) {
    await this.page.setInputFiles(selector, filePath);
  }

  /**
   * Take screenshot
   */
  async screenshot(path: string) {
    await this.page.screenshot({ path, fullPage: true });
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(selector: string) {
    await this.page.waitForSelector(selector, { state: 'hidden' });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Get element text content
   */
  async getTextContent(selector: string): Promise<string | null> {
    return await this.page.textContent(selector);
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(selector: string): Promise<boolean> {
    return await this.page.isEnabled(selector);
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Execute custom script
   */
  async evaluate<T>(script: () => T): Promise<T> {
    return await this.page.evaluate(script);
  }
}
