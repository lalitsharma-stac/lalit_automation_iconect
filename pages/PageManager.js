const LoginPage = require('./LoginPage');
const ProjectsPage = require('./ProjectsPage');
const FieldsPage = require('./FieldsPage');
const RecordsPage = require('./RecordsPage');
const DocumentViewPage = require('./DocumentViewPage');
const AnnotationPage = require('./AnnotationPage');

/**
 * PageManager - Central manager for all page objects
 * Initializes all page objects with the Playwright page instance
 */
class PageManager {
  constructor(page) {
    this.page = page;
    
    // Initialize all page objects
    this.loginPage = new LoginPage(page);
    this.projectsPage = new ProjectsPage(page);
    this.fieldsPage = new FieldsPage(page);
    this.recordsPage = new RecordsPage(page);
    this.documentViewPage = new DocumentViewPage(page);
    this.annotationPage = new AnnotationPage(page);
  }

  /**
   * Get LoginPage instance
   * @returns {LoginPage}
   */
  getLoginPage() {
    return this.loginPage;
  }

  /**
   * Get ProjectsPage instance
   * @returns {ProjectsPage}
   */
  getProjectsPage() {
    return this.projectsPage;
  }

  /**
   * Get FieldsPage instance
   * @returns {FieldsPage}
   */
  getFieldsPage() {
    return this.fieldsPage;
  }

  /**
   * Get RecordsPage instance
   * @returns {RecordsPage}
   */
  getRecordsPage() {
    return this.recordsPage;
  }

  /**
   * Get DocumentViewPage instance
   * @returns {DocumentViewPage}
   */
  getDocumentViewPage() {
    return this.documentViewPage;
  }

  /**
   * Get AnnotationPage instance
   * @returns {AnnotationPage}
   */
  getAnnotationPage() {
    return this.annotationPage;
  }
}

module.exports = PageManager;
