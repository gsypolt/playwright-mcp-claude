import { test, expect } from '@playwright/test';
import { BasePage } from '@/components/base-page';
import { FormComponent } from '@/components/form-component';
import { genericLogin } from '@/helpers/auth';

// Skip these example tests unless TEST_SERVER_RUNNING is set to true
// These tests require a running application server at http://localhost:3000
test.describe.skip('Example UI Tests', () => {
  test('should navigate to homepage and verify title', async ({ page }) => {
    const basePage = new BasePage(page);

    await basePage.goto('/');
    await basePage.waitForReady();

    const title = await basePage.getTitle();
    expect(title).toBeTruthy();
  });

  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    // Example using generic login helper
    await genericLogin(page, {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'password123',
    });

    // Verify successful login by checking URL or element
    await expect(page).toHaveURL(/dashboard|home/);
  });

  test('should fill and submit a form', async ({ page }) => {
    await page.goto('/contact');

    const form = new FormComponent(page, '#contact-form');

    await form.fillByLabel('Name', 'John Doe');
    await form.fillByLabel('Email', 'john@example.com');
    await form.fillByLabel('Message', 'This is a test message');

    await form.submit();

    // Wait for success message
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/register');

    const form = new FormComponent(page, '#register-form');

    // Submit empty form to trigger validation
    await form.submit();

    // Check for validation errors
    const hasErrors = await form.hasValidationErrors();
    expect(hasErrors).toBe(true);

    const errors = await form.getValidationErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('should handle navigation', async ({ page }) => {
    const basePage = new BasePage(page);

    await basePage.goto('/');

    // Click navigation link
    await basePage.clickAndWaitForNavigation('a[href="/about"]');

    // Verify navigation
    expect(basePage.getCurrentUrl()).toContain('/about');
  });

  test('should interact with elements', async ({ page }) => {
    const basePage = new BasePage(page);

    await basePage.goto('/products');
    await basePage.waitForReady();

    // Check if element is visible
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();

    // Click on first product
    await basePage.getByTestId('product-1').click();

    // Verify product details page
    await expect(page.locator('.product-details')).toBeVisible();
  });
});
