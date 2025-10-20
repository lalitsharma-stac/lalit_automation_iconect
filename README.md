# Playwright Test Automation Suite - iCONECT

## 📋 Overview

This is a Playwright-based test automation suite for the iCONECT application, implementing the **Page Object Model (POM)** design pattern for maintainable and scalable test automation.

## 🏗️ Project Structure

```
lalit-automation-iconect/
├── pages/                      # Page Object Model files
│   ├── PageManager.js          # Central manager for all page objects
│   ├── LoginPage.js            # Login page actions
│   ├── ProjectsPage.js         # Projects page actions
│   ├── FieldsPage.js           # Fields management
│   ├── RecordsPage.js          # Records view and mass actions
│   ├── DocumentViewPage.js     # Document viewer
│   ├── AnnotationPage.js       # Annotations and redactions
│   └── README.md               # POM documentation
├── tests/                      # Test files
│   ├── FullWorkflow.spec.js    # Main workflow test
│   └── testData/               # Test data files
│       └── LT_TextData.js      # Test data for LT FIELD1
├── mcp-server/                 # MCP server for AI agent integration
├── node_modules/               # Dependencies
├── test-results/               # Test execution results
├── playwright-report/          # HTML test reports
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies
├── playwright.config.js        # Playwright configuration
└── README.md                   # This file
```

## 🚀 Prerequisites

Before running the tests, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

## 📦 Installation

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd lalit-automation-iconect
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `@playwright/test` - Playwright testing framework
- `@types/node` - TypeScript definitions for Node.js

### 3. Install Playwright Browsers

```bash
npx playwright install
```

This downloads the required browser binaries (Chromium, Firefox, WebKit).

## 🧪 Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test FullWorkflow.spec.js
```

### Run Tests in Specific Browser

```bash
# Chromium
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# WebKit (Safari)
npx playwright test --project=webkit
```

### Run Tests in Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

This opens the Playwright Inspector for step-by-step debugging.

### Run Tests in UI Mode (Interactive)

```bash
npx playwright test --ui
```

This opens an interactive UI to run and debug tests.

## 📊 Viewing Test Reports

### View HTML Report

After test execution, view the HTML report:

```bash
npx playwright show-report
```

This opens a browser with detailed test results, screenshots, and traces.

### View Test Results

Test results are stored in:
- `test-results/` - Detailed test execution data
- `playwright-report/` - HTML report files

## 🎯 Test Coverage

### Full Workflow Test (`FullWorkflow.spec.js`)

This test covers the complete workflow:

1. **Login** - Authenticate user (autouser3)
2. **Navigate Projects** - Verify projects page loads
3. **Open Project** - Open "QA ACL Research3" project
4. **Create Field** - Create "LT FIELD1" (4000 chars)
5. **Select Records** - Select all records in Primary view
6. **Mass Edit** - Update LT FIELD1 with test data
7. **Customize View** - Add LT FIELD1 column to grid
8. **Validate Results** - Verify mass edit success
9. **Execute Searches** - Run multiple search queries
10. **Verify Highlights** - Check search highlighting in document view
11. **Navigate Record** - Go to specific record (#165)
12. **Create Annotations** - Create annotation set and redactions
13. **Verify Persistence** - Confirm redaction persists after reload

## 🔧 Configuration

### Playwright Configuration (`playwright.config.js`)

Key settings:

```javascript
{
  testDir: './tests',           // Test directory
  fullyParallel: true,          // Run tests in parallel
  retries: 0,                   // No retries (2 on CI)
  workers: undefined,           // Max workers (1 on CI)
  reporter: 'html',             // HTML reporter
  trace: 'on-first-retry',      // Trace on retry
}
```

### Supported Browsers

- ✅ Chromium (Chrome, Edge)
- ✅ Firefox
- ✅ WebKit (Safari)

## 📝 Test Data

Test data is stored in `tests/testData/LT_TextData.js`:

```javascript
{
  replacementText: "...",        // 3999 character text
  expectedTextStart: "...",      // Validation text
  searchQueries: [...],          // Search queries
  expectedRecordCount: 179       // Expected result count
}
```

## 🎨 Page Object Model (POM)

### What is POM?

The Page Object Model is a design pattern that:
- Separates test logic from page interactions
- Makes tests more maintainable
- Reduces code duplication
- Improves readability

### Using Page Objects

```javascript
const PageManager = require('../pages/PageManager');

// Initialize Page Manager
const pm = new PageManager(page);

// Use page objects
await pm.loginPage.login('username', 'password');
await pm.fieldsPage.createLimitedTextField('FieldName', '4000');
await pm.recordsPage.selectAllRecords();
```

### Available Page Objects

1. **LoginPage** - Login and authentication
2. **ProjectsPage** - Project navigation
3. **FieldsPage** - Field creation and management
4. **RecordsPage** - Records operations and search
5. **DocumentViewPage** - Document viewer
6. **AnnotationPage** - Annotations and redactions

See `pages/README.md` for detailed documentation.

## 🐛 Debugging

### Debug Mode

```bash
npx playwright test --debug
```

Features:
- Step through test execution
- Inspect page elements
- View console logs
- Set breakpoints

### Screenshots on Failure

Screenshots are automatically captured on test failure and stored in `test-results/`.

### Video Recording

Enable video recording in `playwright.config.js`:

```javascript
use: {
  video: 'on-first-retry',
}
```

### Traces

View traces for failed tests:

```bash
npx playwright show-trace test-results/.../trace.zip
```

## 📈 Best Practices

### 1. Use test.beforeEach for Setup

```javascript
test.beforeEach('Setup', async ({ browser }) => {
  // Setup code (login, navigation, etc.)
});
```

### 2. Use test.step for Organization

```javascript
await test.step('Login to application', async () => {
  // Login steps
});
```

### 3. Use Page Objects

Always use page objects instead of direct locators in tests.

### 4. Add Console Logs

Use console.log for test execution visibility:

```javascript
console.log(`✓ Field created successfully`);
```

### 5. Handle Waits Properly

Use Playwright's auto-waiting and explicit waits when needed:

```javascript
await expect(element).toBeVisible({ timeout: 8000 });
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📞 Troubleshooting

### Tests Timeout

- Increase timeout in `playwright.config.js`
- Check network connectivity
- Verify application is accessible

### Browser Not Found

```bash
npx playwright install
```

### Element Not Found

- Check if page loaded completely
- Verify locator is correct
- Add explicit waits if needed

### Login Issues

- Verify credentials in test
- Check if "already logged in" popup appears
- Review `LoginPage.js` for popup handling

## 🔐 Credentials

Test credentials are hardcoded in `test.beforeEach`:

```javascript
await pm.loginPage.login('autouser3', 'ev26Ue$BN!*n');
```

**Note:** For production, use environment variables:

```javascript
await pm.loginPage.login(
  process.env.TEST_USERNAME,
  process.env.TEST_PASSWORD
);
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)

## 🤝 Contributing

1. Create a new branch for your feature
2. Write tests following POM pattern
3. Ensure all tests pass
4. Submit pull request

## 📄 License

ISC

## 👥 Author

Lalit Sharma

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Framework:** Playwright + Page Object Model
