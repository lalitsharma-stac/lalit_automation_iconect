class LoginPage {
  constructor(page) {
    this.page = page;

    // Locators
    this.usernameInput = page.locator('input#LogOnUserName');
    this.nextButton = page.locator('input[type="submit"][value="Next"]');
    this.passwordInput = page.locator('input#Input_Password');
    this.loginButton = page.locator('input[type="submit"][value="Log In"]');
    this.continueLink = page.getByRole('link', { name: 'Continue' });
    this.userNameDisplay = page.locator('#userInfoMenus .k-button-text');
  }

  async goto() {
    await this.page.goto('https://v11support.iconect.com/account/signin?ReturnUrl=%2F', {
      waitUntil: 'domcontentloaded',
      timeout: 190000
    });
    await this.usernameInput.waitFor({ state: 'visible', timeout: 130000 });
  }

  async login(username, password) {
    // Fill username
    await this.usernameInput.fill(username);
    await this.nextButton.click();

    // Fill password
    await this.passwordInput.waitFor({ state: 'visible', timeout: 130000 });
    await this.passwordInput.fill(password);

    // Click login and handle potential "already logged in" popup
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 160000 }),
      this.loginButton.click()
    ]);

    // Handle "already logged in" popup if it shows up
    if (await this.continueLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.continueLink.click();
      await this.page.waitForLoadState('networkidle', { timeout: 150000 });
    }
    
    // Wait for the main UI to appear
    await this.userNameDisplay.waitFor({ state: 'visible', timeout: 160000 });
  }

    /**
   * Verify user is logged in by checking username display
   * @param {string} expectedUserName
   * @returns {Promise<boolean>}
   */
  async verifyLogin(expectedUserName) {
    let foundusername = false;
   
    // Wait up to 2 minutes with 10-second intervals (12 attempts)
    for (let i = 0; i < 12 && !foundusername; i++) {
      if (await this.userNameDisplay.isVisible().catch(() => false)) {
        const text = await this.userNameDisplay.innerText();
        if (text.trim() === expectedUserName) {
          foundusername = true;
          break;
        }
      }
      console.log(`  ⏳ Waiting for username to appear (attempt ${i + 1}/12)...`);
      await this.page.waitForTimeout(10000);
    }
 
    if (!foundusername) {
      throw new Error(`Username "${expectedUserName}" did not appear in time`);
    }
 
    return foundusername;
  } 
  /**
   * Get displayed username
   * @returns {Promise<string>}
   */
  async getDisplayedUsername() {
    return await this.userNameDisplay.innerText();
  }
}
 
module.exports = LoginPage;