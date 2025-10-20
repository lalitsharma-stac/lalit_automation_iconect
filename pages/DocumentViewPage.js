const { expect } = require('@playwright/test');

class DocumentViewPage {
  constructor(page) {
    this.page = page;
    
    // Locators
    this.documentViewButton = page.locator('button:has(span.k-button-icon.fas.fa-chevron-right)');
    this.textView = page.locator('div.viewer_document.x-flexbox--flex.x-flexbox_column');
    this.recordInput = page.locator('input#docNumInput');
  }

  /**
   * Navigate to document view
   */
  async navigateToDocumentView() {
    await this.documentViewButton.waitFor({ state: 'visible', timeout: 30000 });
    await this.documentViewButton.click();
    // await this.page.waitForTimeout(3000); // Wait for document view to load
    await this.page.waitForSelector('.loading, .spinner', { state: 'detached', timeout: 80000 }).catch(() => {});
    await this.textView.waitFor({ state: 'visible', timeout: 80000 });
  }

  /**
   * Get highlights for a specific text
   * @param {string} searchText 
   * @returns {Promise<any>}
   */
  getHighlights(searchText) {
    return this.textView.locator('span', { hasText: searchText });
  }

  /**
   * Verify highlights exist and are visible
   * @param {string} searchText 
   * @returns {Promise<number>}
   */
  async verifyHighlights(searchText) {
    // Wait for text view to have content (document text loaded)
    await this.page.waitForTimeout(5000); // Extra wait for document to render
    
    // Wait for textView to have some text content
    await this.textView.waitFor({ state: 'visible', timeout: 30000 });
    
    // Retry logic to wait for highlights to appear
    let highlightCount = 0;
    for (let i = 0; i < 5; i++) {
      const highlights = this.getHighlights(searchText);
      highlightCount = await highlights.count();
      
      if (highlightCount > 0) {
        await highlights.first().scrollIntoViewIfNeeded();
        await expect(highlights.first()).toBeVisible();
        break;
      }
      
      // Wait and retry if no highlights found
      console.log(`  ⏳ Waiting for highlights to appear (attempt ${i + 1}/5)...`);
      await this.page.waitForTimeout(2000);
    }
    
    return highlightCount;
  }

  /**
   * Verify highlights are only in specific field
   * @param {string} searchText 
   * @param {string} fieldName 
   * @returns {Promise<boolean>}
   */
  async verifyHighlightsInField(searchText, fieldName) {
    const highlights = this.getHighlights(searchText);
    const highlightCount = await highlights.count();
    
    if (highlightCount === 0) {
      return false;
    }
    
    for (let i = 0; i < highlightCount; i++) {
      try {
        // Check multiple ancestor levels to find the field name
        const ancestorDiv = highlights.nth(i).locator('xpath=ancestor::div[contains(., "' + fieldName + '")]').first();
        const ancestorText = await ancestorDiv.innerText({ timeout: 5000 });
        
        if (!ancestorText.includes(fieldName)) {
          console.log(`  ⚠ Highlight ${i + 1} not found in ${fieldName}`);
          return false;
        }
      } catch (error) {
        // If ancestor with field name not found, highlight is not in the field
        console.log(`  ⚠ Highlight ${i + 1} ancestor check failed: ${error.message}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Navigate to specific record number
   * @param {string} recordNumber 
   */
  async navigateToRecord(recordNumber) {
    await this.recordInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.recordInput.fill('');
    await this.recordInput.fill(recordNumber);
    await this.recordInput.press('Enter');
    await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    await this.page.waitForTimeout(3000); // Wait for record to load
  }

  /**
   * Verify current record number in URL
   * @param {string} recordNumber 
   * @returns {Promise<boolean>}
   */
  async verifyRecordInURL(recordNumber) {
    // Match: /projects/{projectId}/records/{recordNumber} with optional query params
    const regex = new RegExp(`\/records\/${recordNumber}(?:\\?|$)`, 'i');
    await expect(this.page).toHaveURL(regex, { timeout: 30000 }); // Increased timeout for slow site
    return true;
  }
}

module.exports = DocumentViewPage;
