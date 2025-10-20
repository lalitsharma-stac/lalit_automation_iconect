class ProjectsPage {
  constructor(page) {
    this.page = page;
    
    // Locators
    this.projectsTitle = page.locator('div.k-h1.x-flexbox_row span');
    this.goToRecordsLink = page.getByRole('link', { name: 'Go to Records' });
  }

  /**
   * Verify Projects page is loaded
   * @returns {Promise<boolean>}
   */
  async verifyProjectsPageLoaded() {
    let headingText = '';
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.page.waitForSelector('div.k-h1.x-flexbox_row span', { 
          state: 'visible', 
          timeout: 6000 
        });
        headingText = (await this.projectsTitle.first().innerText()).trim();
        if (headingText.includes('Project')) break;
      } catch (e) {
        await this.page.waitForTimeout(2000);
      }
    }

    return headingText.includes('Project');
  }

  /**
   * Open a project by clicking "Go to Records"
   * @param {string} projectName - Expected project name for validation
   */
  async openProject(projectName) {
    // Wait for link to be visible and ready
    await this.goToRecordsLink.waitFor({ state: 'visible', timeout: 30000 });
    await this.page.waitForTimeout(2000); // Extra wait for link to be interactive
    
    // Click and wait for navigation
    await this.goToRecordsLink.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 120000 }); // 2 minutes for slow site
    await this.page.waitForTimeout(5000); // Wait for page to stabilize
  }

  /**
   * Verify project is opened by checking page title
   * @param {string} expectedTitle 
   * @returns {Promise<boolean>}
   */
  async verifyProjectOpened(expectedTitle) {
    const pageTitle = await this.page.title();
    return pageTitle.includes(expectedTitle);
  }

  /**
   * Get current page title
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return await this.page.title();
  }
}

module.exports = ProjectsPage;
