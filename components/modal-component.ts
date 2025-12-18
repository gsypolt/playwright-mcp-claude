import { Page, Locator } from '@playwright/test';

/**
 * Reusable modal/dialog component
 */
export class ModalComponent {
  constructor(
    private page: Page,
    private modalSelector: string = '[role="dialog"], .modal, .dialog'
  ) {}

  /**
   * Get modal element
   */
  getModal(): Locator {
    return this.page.locator(this.modalSelector).first();
  }

  /**
   * Wait for modal to be visible
   */
  async waitForVisible() {
    await this.getModal().waitFor({ state: 'visible' });
  }

  /**
   * Wait for modal to be hidden
   */
  async waitForHidden() {
    await this.getModal().waitFor({ state: 'hidden' });
  }

  /**
   * Check if modal is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.getModal().isVisible();
  }

  /**
   * Get modal title
   */
  async getTitle(): Promise<string | null> {
    return await this.getModal().locator('h1, h2, h3, [role="heading"]').first().textContent();
  }

  /**
   * Get modal content
   */
  async getContent(): Promise<string | null> {
    return await this.getModal().locator('.modal-body, .dialog-content').textContent();
  }

  /**
   * Click primary button (OK, Confirm, Submit, etc.)
   */
  async clickPrimary() {
    await this.getModal()
      .locator(
        'button[type="submit"], button.primary, button:has-text("OK"), button:has-text("Confirm")'
      )
      .first()
      .click();
  }

  /**
   * Click secondary button (Cancel, Close, etc.)
   */
  async clickSecondary() {
    await this.getModal()
      .locator(
        'button[type="button"]:has-text("Cancel"), button:has-text("Close"), button.secondary'
      )
      .first()
      .click();
  }

  /**
   * Close modal using X button
   */
  async close() {
    await this.getModal()
      .locator('button[aria-label="Close"], .close, [data-dismiss="modal"]')
      .first()
      .click();
  }

  /**
   * Close modal using Escape key
   */
  async closeWithEscape() {
    await this.page.keyboard.press('Escape');
  }

  /**
   * Fill form inside modal
   */
  async fillField(label: string, value: string) {
    await this.getModal().getByLabel(label).fill(value);
  }

  /**
   * Click button by text inside modal
   */
  async clickButton(text: string) {
    await this.getModal().getByRole('button', { name: text }).click();
  }
}
