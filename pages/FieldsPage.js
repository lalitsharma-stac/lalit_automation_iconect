const { expect } = require('@playwright/test');

class FieldsPage {
  constructor(page) {
    this.page = page;
    
    // Locators
    this.fieldsLink = page.getByRole('link', { name: 'Fields' });
    this.newFieldButton = page.getByRole('button', { name: 'New Field' });
    this.nameInput = page.getByPlaceholder('Name');
    this.lengthInput = page.getByRole('textbox', { name: 'Length' });
    this.createFieldButton = page.getByRole('button', { name: 'Create Field' });
    this.fieldRows = page.locator('tbody tr');
  }

  /**
   * Navigate to Fields page
   */
  async navigateToFields() {
    await expect(this.fieldsLink).toBeVisible({ timeout: 8000 });
    await expect(this.fieldsLink).toBeEnabled({ timeout: 8000 });
    await this.fieldsLink.click();
  }

  /**
   * Click New Field button
   */
  async clickNewField() {
    await expect(this.newFieldButton).toBeVisible({ timeout: 12000 });
    await expect(this.newFieldButton).toBeEnabled({ timeout: 12000 });
    await this.newFieldButton.click();
  }

  /**
   * Fill field name
   * @param {string} name 
   */
  async fillFieldName(name) {
    await expect(this.nameInput).toBeVisible({ timeout: 8000 });
    await expect(this.nameInput).toBeEnabled({ timeout: 8000 });
    await this.nameInput.fill(name);
  }

  /**
   * Fill field length
   * @param {string} length 
   */
  async fillFieldLength(length) {
    await this.lengthInput.click();
    await expect(this.lengthInput).toBeVisible({ timeout: 8000 });
    await expect(this.lengthInput).toBeEnabled({ timeout: 8000 });
    await this.lengthInput.fill(length);
  }

  /**
   * Click Create Field button
   */
  async clickCreateField() {
    await expect(this.createFieldButton).toBeVisible({ timeout: 8000 });
    await expect(this.createFieldButton).toBeEnabled({ timeout: 8000 });
    await this.createFieldButton.click();
  }

  /**
   * Create a new limited text field
   * @param {string} fieldName 
   * @param {string} fieldLength 
   */
  async createLimitedTextField(fieldName, fieldLength) {
    await this.clickNewField();
    await this.fillFieldName(fieldName);
    await this.fillFieldLength(fieldLength);
    await this.clickCreateField();
  }

  /**
   * Verify field is created and appears in the grid
   * @param {string} fieldName 
   * @param {number} maxRetries 
   * @param {number} retryDelay 
   * @returns {Promise<boolean>}
   */
  async verifyFieldCreated(fieldName, maxRetries = 5, retryDelay = 4000) {
    let found = false;

    for (let attempt = 0; attempt < maxRetries && !found; attempt++) {
      await this.page.waitForTimeout(retryDelay);
      const rowCount = await this.fieldRows.count();
      
      for (let i = 0; i < rowCount; i++) {
        const rowText = await this.fieldRows.nth(i).innerText();
        if (rowText.includes(fieldName)) {
          found = true;
          break;
        }
      }
      
      if (!found && attempt < maxRetries - 1) {
        console.log(`  Retry ${attempt + 1}: Field '${fieldName}' not found yet, retrying...`);
      }
    }

    return found;
  }
}

module.exports = FieldsPage;
