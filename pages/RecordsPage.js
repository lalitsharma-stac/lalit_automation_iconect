const { expect } = require('@playwright/test');

class RecordsPage {
  constructor(page) {
    this.page = page;
    
    // Locators
    this.recordsLink = page.getByRole('link', { name: 'Records' }).first();
    this.primaryWidget = page.getByText('Primary', { exact: true });
    this.selectAllCheckbox = page.locator('input[type="checkbox"][aria-label="Select All"]');
    this.massActionButton = page.locator('//button[@id="toggle_mass_action"]');
    this.editRadio = page.locator('input#ma-action-radio-edit[type="radio"][value="Edit"]');
    this.nextButton = page.locator('//button[@id="maButton-Next"]');
    this.fieldCombobox = page.getByRole('combobox', { name: 'Field', exact: true });
    this.fieldListbox = page.locator('#maFindInField_listbox');
    this.replaceTextInput = page.getByRole('textbox', { name: 'Replace Text' });
    this.goButton = page.getByRole('button', { name: 'Go', exact: true });
    this.yesButton = page.getByRole('button', { name: 'Yes' });
    this.customizeViewButton = page.locator('button[title="Customize the View"]');
    this.moveRightButton = page.locator('button[title="Move Selected Right"]:not([disabled])');
    this.moveTopButton = page.locator('button[title="Move Selected to the Top"]:not([disabled])');
    this.applyButton = page.getByRole('button', { name: 'Apply' });
    this.searchInput = page.locator('input#search_builder_input_widget_datastore_0');
    this.resultCounter = page.locator('span[title="Active Search Record Count"].x-text_bold');
    this.totalCounter = page.locator('span[title="Total Record Count"]');
  }

  /**
   * Navigate to Records page
   * @param {boolean} forceRefresh - Force navigation even if already on Records page to refresh field metadata
   */
  async navigateToRecords(forceRefresh = false) {
    // Always navigate to Records page (don't use reload as it stays on current page)
    await this.recordsLink.waitFor({ state: 'visible', timeout: 30000 });
    await this.recordsLink.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    
    if (forceRefresh) {
      // Extra wait for field metadata to refresh after field creation
      await this.page.waitForTimeout(15000); // Longer wait for metadata to propagate
    } else {
      await this.page.waitForTimeout(8000); // Normal wait for Records page to load
    }
    
    await expect(this.primaryWidget).toBeVisible({ timeout: 30000 }); // Increased timeout for slow site
  }

  /**
   * Select all records
   */
  async selectAllRecords() {
    await this.selectAllCheckbox.waitFor({ state: 'visible', timeout: 150000 });
    await this.selectAllCheckbox.click({ force: true });
    await this.page.waitForTimeout(5000); // Wait for selection to register
    await expect(this.selectAllCheckbox).toBeChecked({ timeout: 150000 });
  }

  /**
   * Verify all records are selected
   * @returns {Promise<boolean>}
   */
  async verifyRecordsSelected() {
    return await this.selectAllCheckbox.isChecked();
  }

  /**
   * Open Mass Action menu
   */
  async openMassAction() {
    await this.massActionButton.waitFor({ state: 'visible', timeout: 80000 });
    await this.massActionButton.click();
    await this.page.waitForTimeout(5000); // Wait for menu to open
  }

  /**
   * Select Edit option in Mass Action
   */
  async selectEditAction() {
    await expect(this.editRadio).toBeVisible({ timeout: 80000 });
    await expect(this.editRadio).toBeEnabled({ timeout: 80000 });
    await this.editRadio.check();
    await this.page.waitForTimeout(5000);
    await this.nextButton.click();
    await this.page.waitForTimeout(8000); // Wait for next step
  }

  /**
   * Select field from dropdown
   * @param {string} fieldName 
   */
  async selectField(fieldName) {
    await expect(this.fieldCombobox).toBeVisible({ timeout: 30000 });
    await this.fieldCombobox.click();
    await this.page.waitForSelector('#maFindInField_listbox', { state: 'visible', timeout: 30000 });
    await this.page.waitForTimeout(2000); // Wait longer for list to populate with new fields
    
    // Wait for the specific field to appear in the list
    const fieldOption = this.page.locator(`#maFindInField_listbox li:has-text("${fieldName}")`);
    await fieldOption.waitFor({ state: 'visible', timeout: 30000 });
    await fieldOption.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill replacement text
   * @param {string} text 
   */
  async fillReplacementText(text) {
    await expect(this.replaceTextInput).toBeVisible({ timeout: 30000 });
    await this.replaceTextInput.click();
    await this.replaceTextInput.fill(text);
    await this.page.waitForTimeout(500);
  }

  /**
   * Submit mass action
   */
  async submitMassAction() {
    await this.goButton.click();
    await this.page.waitForTimeout(1000); // Wait for confirmation dialog
    await this.yesButton.waitFor({ state: 'visible', timeout: 30000 });
    await this.yesButton.click({ modifiers: ['Shift'] });
    await this.page.waitForTimeout(5000); // Wait for mass edit to process
  }

  /**
   * Perform mass edit on a field
   * @param {string} fieldName 
   * @param {string} replacementText 
   */
  async performMassEdit(fieldName, replacementText) {
    await this.openMassAction();
    await this.selectEditAction();
    await this.selectField(fieldName);
    await this.fillReplacementText(replacementText);
    await this.submitMassAction();
  }

  /**
   * Customize view to show a specific field
   * @param {string} fieldName 
   */
  async customizeViewToShowField(fieldName) {
    await this.customizeViewButton.waitFor({ state: 'visible', timeout: 30000 });
    await this.customizeViewButton.click();
    await this.page.waitForTimeout(1000); // Wait for dialog
    await this.page.getByRole('gridcell', { name: fieldName }).click();
    await this.page.waitForTimeout(500);
    await this.moveRightButton.click();
    await this.page.waitForTimeout(500);
    await this.moveTopButton.click();
    await this.page.waitForTimeout(500);
    await this.applyButton.click();
    await this.page.waitForTimeout(3000); // Wait for view to update
  }

  /**
   * Verify field column is visible in grid
   * @param {string} fieldName 
   * @returns {Promise<boolean>}
   */
  async verifyFieldColumnVisible(fieldName) {
    const fieldHeader = this.page.locator('th span.k-column-title', { hasText: fieldName });
    await expect(fieldHeader).toBeVisible({ timeout: 8000 });
    return true;
  }

  /**
   * Verify mass edit results in grid
   * @param {string} expectedText 
   * @returns {Promise<number>}
   */
  async verifyMassEditResults(expectedText) {
    const cells = this.page.locator('tbody tr[role="row"]').filter({ hasText: expectedText });
    const rowCount = await cells.count();
    return rowCount;
  }

  /**
   * Execute search query
   * @param {string} query 
   */
  async executeSearch(query) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  /**
   * Verify search results
   * @param {string} expectedResult - e.g., "179 / 179"
   */
  async verifySearchResults(expectedResult) {
    await expect(this.page.getByText(expectedResult)).toBeVisible({ timeout: 15000 });
  }

  /**
   * Get search result counts
   * @returns {Promise<{resultCount: number, totalCount: number}>}
   */
  async getSearchCounts() {
    await expect(this.resultCounter).toBeVisible({ timeout: 8000 });
    await expect(this.totalCounter).toBeVisible({ timeout: 8000 });
    
    const resultCount = parseInt(await this.resultCounter.innerText(), 10);
    const totalCount = parseInt(await this.totalCounter.innerText(), 10);
    
    return { resultCount, totalCount };
  }

  /**
   * Execute multiple search queries and validate
   * @param {string[]} queries 
   * @param {string} expectedResult 
   */
  async executeMultipleSearches(queries, expectedResult) {
    for (const query of queries) {
      await this.executeSearch(query);
      await this.verifySearchResults(expectedResult);
    }
  }
}

module.exports = RecordsPage;
