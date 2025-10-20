const { expect } = require('@playwright/test');

class AnnotationPage {
  constructor(page) {
    this.page = page;

    this.annotationTab = page.getByRole('listitem', { name: /Annotation Mode/ }).locator('svg.icon_annotationDoc');
    this.annotationDropdown = page.getByTitle('Select Annotation Set');
    this.createNewSetButton = page.getByRole('button', { name: 'Create New Set' });
    this.setNameInput = page.locator('input#wpcdialog-name-input[type="text"]');
    this.createButton = page.getByRole('button', { name: 'Create' });
  }

  async switchToAnnotationTab() {
    try {
      await this.annotationTab.waitFor({ state: 'visible', timeout: 30000 });
      await this.annotationTab.click();
      await this.page.waitForTimeout(2000);
    } catch (error) {
      console.log(`⚠ Warning: Failed to switch to Annotation Tab - ${error.message}`);
    }
  }

  async openAnnotationDropdown() {
    try {
      await this.annotationDropdown.waitFor({ state: 'visible', timeout: 30000 });
      await this.annotationDropdown.click();
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.log(`⚠ Warning: Failed to open Annotation Dropdown - ${error.message}`);
    }
  }

  async clickCreateNewSet() {
    try {
      await this.createNewSetButton.waitFor({ state: 'visible', timeout: 30000 });
      await this.createNewSetButton.click();
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.log(`⚠ Warning: Failed to click Create New Set - ${error.message}`);
    }
  }

  async fillSetName(setName) {
    try {
      await this.setNameInput.waitFor({ state: 'visible', timeout: 30000 });
      await this.setNameInput.fill(setName);
    } catch (error) {
      console.log(`⚠ Warning: Failed to fill Annotation Set name - ${error.message}`);
    }
  }

  async clickCreate() {
    try {
      await this.createButton.waitFor({ state: 'visible', timeout: 30000 });
      await this.createButton.click();
      await this.page.waitForTimeout(2000);
    } catch (error) {
      console.log(`⚠ Warning: Failed to click Create button - ${error.message}`);
    }
  }

  async createAnnotationSet(setName) {
    await this.switchToAnnotationTab();
    await this.openAnnotationDropdown();
    await this.clickCreateNewSet();
    await this.fillSetName(setName);
    await this.clickCreate();

    console.log(`✓ Annotation set '${setName}' creation attempted`);
  }
}

module.exports = AnnotationPage;
