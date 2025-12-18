import { Page, Locator } from '@playwright/test';

/**
 * Reusable form component for handling form interactions
 */
export class FormComponent {
  constructor(
    private page: Page,
    private formSelector: string = 'form'
  ) {}

  /**
   * Get form element
   */
  getForm(): Locator {
    return this.page.locator(this.formSelector);
  }

  /**
   * Fill text input by label
   */
  async fillByLabel(label: string, value: string) {
    await this.page.getByLabel(label).fill(value);
  }

  /**
   * Fill text input by name
   */
  async fillByName(name: string, value: string) {
    await this.page.locator(`[name="${name}"]`).fill(value);
  }

  /**
   * Fill text input by placeholder
   */
  async fillByPlaceholder(placeholder: string, value: string) {
    await this.page.getByPlaceholder(placeholder).fill(value);
  }

  /**
   * Select dropdown option by label
   */
  async selectByLabel(label: string, value: string) {
    await this.page.getByLabel(label).selectOption(value);
  }

  /**
   * Check checkbox by label
   */
  async checkByLabel(label: string) {
    await this.page.getByLabel(label).check();
  }

  /**
   * Uncheck checkbox by label
   */
  async uncheckByLabel(label: string) {
    await this.page.getByLabel(label).uncheck();
  }

  /**
   * Click radio button by label
   */
  async selectRadioByLabel(label: string) {
    await this.page.getByLabel(label).click();
  }

  /**
   * Upload file
   */
  async uploadFile(inputName: string, filePath: string | string[]) {
    await this.page.locator(`input[name="${inputName}"][type="file"]`).setInputFiles(filePath);
  }

  /**
   * Submit form
   */
  async submit() {
    await this.getForm().locator('button[type="submit"]').click();
  }

  /**
   * Fill entire form with data
   */
  async fillForm(data: Record<string, unknown>) {
    for (const [key, value] of Object.entries(data)) {
      const input = this.page.locator(`[name="${key}"]`);
      const inputType = await input.getAttribute('type');

      if (inputType === 'checkbox') {
        if (value) {
          await input.check();
        } else {
          await input.uncheck();
        }
      } else if (inputType === 'radio') {
        await this.page.locator(`[name="${key}"][value="${String(value)}"]`).click();
      } else if (inputType === 'file') {
        await input.setInputFiles(value as string | string[]);
      } else {
        await input.fill(String(value));
      }
    }
  }

  /**
   * Get form validation errors
   */
  async getValidationErrors(): Promise<string[]> {
    const errors = await this.page.locator('.error, .invalid-feedback, [role="alert"]').allTextContents();
    return errors.filter(Boolean);
  }

  /**
   * Check if form has validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const errors = await this.getValidationErrors();
    return errors.length > 0;
  }

  /**
   * Clear all form fields
   */
  async clearForm() {
    await this.getForm().evaluate((form) => {
      if ('reset' in form && typeof form.reset === 'function') {
        (form.reset as () => void)();
      }
    });
  }

  /**
   * Get form data
   */
  async getFormData(): Promise<Record<string, unknown>> {
    return await this.getForm().evaluate((form) => {
      const data: Record<string, unknown> = {};
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach((input: unknown) => {
        const el = input as { name?: string; value?: string; checked?: boolean; type?: string };
        if (el.name) {
          if (el.type === 'checkbox' || el.type === 'radio') {
            if (el.checked) {
              data[el.name] = el.value;
            }
          } else {
            data[el.name] = el.value;
          }
        }
      });
      return data;
    });
  }
}
