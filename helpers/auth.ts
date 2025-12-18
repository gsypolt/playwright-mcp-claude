import { Page } from '@playwright/test';

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Generic login helper for basic email/password authentication
 * @param page - Playwright page object
 * @param credentials - Email and password
 * @param selectors - Custom selectors for email, password, and submit button
 */
export async function genericLogin(
  page: Page,
  credentials: LoginCredentials,
  selectors = {
    email: 'input[type="email"], input[name="email"], #email',
    password: 'input[type="password"], input[name="password"], #password',
    submit: 'button[type="submit"], input[type="submit"], button:has-text("Sign in")',
  }
) {
  await page.fill(selectors.email, credentials.email);
  await page.fill(selectors.password, credentials.password);
  await page.click(selectors.submit);

  // Wait for navigation or success indicator
  await page.waitForLoadState('networkidle');
}

/**
 * Google OAuth login helper
 * Handles the Google login flow with popup or redirect
 * @param page - Playwright page object
 * @param credentials - Google email and password
 */
export async function googleLogin(
  page: Page,
  credentials: LoginCredentials
) {
  // Handle Google Sign-In popup or redirect
  const isPopup = page.url().includes('accounts.google.com');

  if (isPopup) {
    // Fill email
    await page.fill('input[type="email"]', credentials.email);
    await page.click('#identifierNext, button:has-text("Next")');

    // Wait for password field
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    // Fill password
    await page.fill('input[type="password"]', credentials.password);
    await page.click('#passwordNext, button:has-text("Next")');

    // Wait for authentication to complete
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Initiates Google OAuth flow from a button click
 * @param page - Playwright page object
 * @param credentials - Google email and password
 * @param buttonSelector - Selector for the "Sign in with Google" button
 */
export async function loginWithGoogle(
  page: Page,
  credentials: LoginCredentials,
  buttonSelector = 'button:has-text("Sign in with Google"), [data-provider="google"]'
) {
  const [popup] = await Promise.all([
    page.context().waitForEvent('page'),
    page.click(buttonSelector),
  ]);

  await popup.waitForLoadState('domcontentloaded');
  await googleLogin(popup, credentials);

  // Wait for popup to close and authentication to complete
  await popup.waitForEvent('close');
  await page.waitForLoadState('networkidle');
}

/**
 * Microsoft OAuth login helper
 * Handles the Microsoft login flow with popup or redirect
 * @param page - Playwright page object
 * @param credentials - Microsoft email and password
 */
export async function microsoftLogin(
  page: Page,
  credentials: LoginCredentials
) {
  const isMicrosoftPage = page.url().includes('login.microsoftonline.com') ||
                          page.url().includes('login.live.com');

  if (isMicrosoftPage) {
    // Fill email
    await page.fill('input[type="email"], input[name="loginfmt"]', credentials.email);
    await page.click('input[type="submit"], button:has-text("Next")');

    // Wait for password field
    await page.waitForSelector('input[type="password"], input[name="passwd"]', { timeout: 5000 });

    // Fill password
    await page.fill('input[type="password"], input[name="passwd"]', credentials.password);
    await page.click('input[type="submit"], button:has-text("Sign in")');

    // Handle "Stay signed in?" prompt
    try {
      await page.waitForSelector('input[type="submit"]', { timeout: 3000 });
      await page.click('input[type="submit"]:has-text("Yes"), input[type="submit"]:has-text("No")');
    } catch {
      // Prompt may not appear
    }

    await page.waitForLoadState('networkidle');
  }
}

/**
 * Initiates Microsoft OAuth flow from a button click
 * @param page - Playwright page object
 * @param credentials - Microsoft email and password
 * @param buttonSelector - Selector for the "Sign in with Microsoft" button
 */
export async function loginWithMicrosoft(
  page: Page,
  credentials: LoginCredentials,
  buttonSelector = 'button:has-text("Sign in with Microsoft"), [data-provider="microsoft"]'
) {
  const [popup] = await Promise.all([
    page.context().waitForEvent('page'),
    page.click(buttonSelector),
  ]);

  await popup.waitForLoadState('domcontentloaded');
  await microsoftLogin(popup, credentials);

  // Wait for popup to close and authentication to complete
  await popup.waitForEvent('close');
  await page.waitForLoadState('networkidle');
}

/**
 * Save authentication state to a file for reuse
 * @param page - Playwright page object
 * @param path - Path to save the auth state
 */
export async function saveAuthState(page: Page, path: string) {
  await page.context().storageState({ path });
}

/**
 * Check if user is authenticated by looking for common auth indicators
 * @param page - Playwright page object
 * @returns boolean indicating if user appears to be authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check for common authenticated user indicators
    const indicators = [
      '[data-testid="user-menu"]',
      '[data-testid="logout"]',
      'button:has-text("Logout")',
      'button:has-text("Sign out")',
      '.user-avatar',
      '.user-profile',
    ];

    for (const selector of indicators) {
      const element = await page.$(selector);
      if (element) return true;
    }

    return false;
  } catch {
    return false;
  }
}
