#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class EnhancedPlaywrightMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'playwright-automation-ai-agent',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.projectRoot = path.resolve(__dirname, '..');
    this.testsDir = path.join(this.projectRoot, 'tests');
    this.pagesDir = path.join(this.projectRoot, 'pages');
    this.fixturesDir = path.join(this.projectRoot, 'fixtures');
    this.utilsDir = path.join(this.projectRoot, 'utils');
    
    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Test Management
        {
          name: 'list_tests',
          description: 'List all Playwright test files in the project',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'read_test',
          description: 'Read the content of a specific test file',
          inputSchema: {
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                description: 'Name of the test file (e.g., example.spec.js)',
              },
            },
            required: ['filename'],
          },
        },
        {
          name: 'create_test',
          description: 'Create a new Playwright test file with AI-generated content',
          inputSchema: {
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                description: 'Name of the new test file (e.g., login.spec.js)',
              },
              description: {
                type: 'string',
                description: 'Description of what the test should do',
              },
              url: {
                type: 'string',
                description: 'URL to test (optional)',
              },
            },
            required: ['filename', 'description'],
          },
        },
        {
          name: 'update_test',
          description: 'Update an existing test file',
          inputSchema: {
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                description: 'Name of the test file to update',
              },
              content: {
                type: 'string',
                description: 'New content for the test file',
              },
            },
            required: ['filename', 'content'],
          },
        },
        
        // Test Execution
        {
          name: 'run_test',
          description: 'Run Playwright tests with various options',
          inputSchema: {
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                description: 'Specific test file to run (optional, runs all if not specified)',
              },
              headed: {
                type: 'boolean',
                description: 'Run tests in headed mode (visible browser)',
                default: false,
              },
              debug: {
                type: 'boolean',
                description: 'Run tests in debug mode',
                default: false,
              },
              project: {
                type: 'string',
                description: 'Specific project/browser to run (chromium, firefox, webkit)',
              },
              grep: {
                type: 'string',
                description: 'Run tests matching this pattern',
              },
            },
          },
        },
        {
          name: 'run_test_ui',
          description: 'Open Playwright UI mode for interactive testing',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        
        // Code Generation
        {
          name: 'generate_page_object',
          description: 'Generate a Page Object Model class for a specific page',
          inputSchema: {
            type: 'object',
            properties: {
              pageName: {
                type: 'string',
                description: 'Name of the page (e.g., LoginPage)',
              },
              url: {
                type: 'string',
                description: 'URL of the page',
              },
              selectors: {
                type: 'array',
                description: 'Array of selector objects with name and selector',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    selector: { type: 'string' },
                  },
                },
              },
            },
            required: ['pageName'],
          },
        },
        {
          name: 'generate_test_data',
          description: 'Generate test data fixtures',
          inputSchema: {
            type: 'object',
            properties: {
              dataType: {
                type: 'string',
                description: 'Type of test data (users, products, etc.)',
              },
              count: {
                type: 'number',
                description: 'Number of records to generate',
                default: 5,
              },
            },
            required: ['dataType'],
          },
        },
        
        // Analysis & Debugging
        {
          name: 'analyze_test',
          description: 'Analyze a test file and provide suggestions for improvement',
          inputSchema: {
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                description: 'Test file to analyze',
              },
            },
            required: ['filename'],
          },
        },
        {
          name: 'get_test_results',
          description: 'Get the latest test results and analyze failures',
          inputSchema: {
            type: 'object',
            properties: {
              detailed: {
                type: 'boolean',
                description: 'Include detailed failure analysis',
                default: false,
              },
            },
          },
        },
        {
          name: 'show_trace',
          description: 'Show trace viewer for failed tests',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        
        // Configuration
        {
          name: 'get_playwright_config',
          description: 'Read the Playwright configuration file',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'update_playwright_config',
          description: 'Update Playwright configuration',
          inputSchema: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: 'New configuration content',
              },
            },
            required: ['content'],
          },
        },
        
        // Utilities
        {
          name: 'codegen',
          description: 'Launch Playwright Codegen to record user actions',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to start recording from',
              },
            },
          },
        },
        {
          name: 'install_browsers',
          description: 'Install Playwright browsers',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'playwright://tests',
          name: 'All Test Files',
          description: 'List of all Playwright test files',
          mimeType: 'application/json',
        },
        {
          uri: 'playwright://config',
          name: 'Playwright Configuration',
          description: 'Current Playwright configuration',
          mimeType: 'text/javascript',
        },
        {
          uri: 'playwright://pages',
          name: 'Page Objects',
          description: 'All Page Object Model files',
          mimeType: 'application/json',
        },
        {
          uri: 'playwright://results',
          name: 'Test Results',
          description: 'Latest test execution results',
          mimeType: 'application/json',
        },
      ],
    }));

    // Read resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;

      if (uri === 'playwright://tests') {
        const tests = await this.listTests();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(tests, null, 2),
            },
          ],
        };
      }

      if (uri === 'playwright://config') {
        const configPath = path.join(this.projectRoot, 'playwright.config.js');
        const config = await fs.readFile(configPath, 'utf-8');
        return {
          contents: [
            {
              uri,
              mimeType: 'text/javascript',
              text: config,
            },
          ],
        };
      }

      if (uri === 'playwright://pages') {
        try {
          const pages = await this.listPageObjects();
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(pages, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({ pages: [], message: 'No page objects found' }, null, 2),
              },
            ],
          };
        }
      }

      if (uri === 'playwright://results') {
        const results = await this.getTestResultsSummary();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_tests':
            return await this.handleListTests();
          
          case 'read_test':
            return await this.handleReadTest(args.filename);
          
          case 'create_test':
            return await this.handleCreateTest(args.filename, args.description, args.url);
          
          case 'update_test':
            return await this.handleUpdateTest(args.filename, args.content);
          
          case 'run_test':
            return await this.handleRunTest(args);
          
          case 'run_test_ui':
            return await this.handleRunTestUI();
          
          case 'generate_page_object':
            return await this.handleGeneratePageObject(args.pageName, args.url, args.selectors);
          
          case 'generate_test_data':
            return await this.handleGenerateTestData(args.dataType, args.count);
          
          case 'analyze_test':
            return await this.handleAnalyzeTest(args.filename);
          
          case 'get_test_results':
            return await this.handleGetTestResults(args.detailed);
          
          case 'show_trace':
            return await this.handleShowTrace();
          
          case 'get_playwright_config':
            return await this.handleGetPlaywrightConfig();
          
          case 'update_playwright_config':
            return await this.handleUpdatePlaywrightConfig(args.content);
          
          case 'codegen':
            return await this.handleCodegen(args.url);
          
          case 'install_browsers':
            return await this.handleInstallBrowsers();
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}\n\nStack: ${error.stack}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // Helper methods
  async listTests() {
    try {
      const files = await fs.readdir(this.testsDir);
      return files.filter(file => file.endsWith('.spec.js') || file.endsWith('.test.js'));
    } catch (error) {
      return [];
    }
  }

  async listPageObjects() {
    try {
      const files = await fs.readdir(this.pagesDir);
      return files.filter(file => file.endsWith('.js') || file.endsWith('.ts'));
    } catch (error) {
      return [];
    }
  }

  async getTestResultsSummary() {
    try {
      const resultsDir = path.join(this.projectRoot, 'test-results');
      const files = await fs.readdir(resultsDir);
      return {
        totalResults: files.length,
        results: files,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        totalResults: 0,
        results: [],
        message: 'No test results found',
      };
    }
  }

  // Tool handlers
  async handleListTests() {
    const tests = await this.listTests();
    return {
      content: [
        {
          type: 'text',
          text: `Found ${tests.length} test file(s):\n${tests.map(t => `- ${t}`).join('\n') || 'No tests found'}`,
        },
      ],
    };
  }

  async handleReadTest(filename) {
    const filePath = path.join(this.testsDir, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: `Content of ${filename}:\n\n\`\`\`javascript\n${content}\n\`\`\``,
        },
      ],
    };
  }

  async handleCreateTest(filename, description, url) {
    const template = `const { test, expect } = require('@playwright/test');

test.describe('${description}', () => {
  test('${description}', async ({ page }) => {
    // Navigate to the page
    ${url ? `await page.goto('${url}');` : '// await page.goto(\'YOUR_URL\');'}
    
    // Add your test steps here
    // Example:
    // await page.locator('selector').click();
    // await expect(page.locator('selector')).toBeVisible();
    
    // TODO: Implement test logic
  });
});
`;

    const filePath = path.join(this.testsDir, filename);
    
    try {
      await fs.access(filePath);
      throw new Error(`Test file ${filename} already exists`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    await fs.writeFile(filePath, template, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully created test file: ${filename}\n\nTemplate:\n\`\`\`javascript\n${template}\n\`\`\``,
        },
      ],
    };
  }

  async handleUpdateTest(filename, content) {
    const filePath = path.join(this.testsDir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully updated test file: ${filename}`,
        },
      ],
    };
  }

  async handleRunTest(args) {
    const { filename, headed, debug, project, grep } = args;
    
    let command = 'npx playwright test';
    
    if (filename) command += ` tests/${filename}`;
    if (headed) command += ' --headed';
    if (debug) command += ' --debug';
    if (project) command += ` --project=${project}`;
    if (grep) command += ` --grep="${grep}"`;
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        maxBuffer: 1024 * 1024 * 10,
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Test execution completed:\n\n\`\`\`\n${stdout}\n${stderr}\n\`\`\``,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Test execution failed:\n\n\`\`\`\n${error.stdout}\n${error.stderr}\n\`\`\`\n\nError: ${error.message}`,
          },
        ],
      };
    }
  }

  async handleRunTestUI() {
    try {
      exec('npx playwright test --ui', { cwd: this.projectRoot });
      return {
        content: [
          {
            type: 'text',
            text: '✅ Playwright UI mode launched! Check your browser.',
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to launch UI mode: ${error.message}`,
          },
        ],
      };
    }
  }

  async handleGeneratePageObject(pageName, url, selectors) {
    // Ensure pages directory exists
    try {
      await fs.mkdir(this.pagesDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const className = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    const selectorsCode = selectors && selectors.length > 0
      ? selectors.map(s => `    this.${s.name} = page.locator('${s.selector}');`).join('\n')
      : '    // Add your selectors here';

    const template = `class ${className} {
  constructor(page) {
    this.page = page;
${selectorsCode}
  }

  async navigate() {
    await this.page.goto('${url || 'YOUR_URL'}');
  }

  // Add your page methods here
}

module.exports = ${className};
`;

    const filename = `${pageName}.js`;
    const filePath = path.join(this.pagesDir, filename);
    
    await fs.writeFile(filePath, template, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully created Page Object: pages/${filename}\n\n\`\`\`javascript\n${template}\n\`\`\``,
        },
      ],
    };
  }

  async handleGenerateTestData(dataType, count = 5) {
    // Ensure fixtures directory exists
    try {
      await fs.mkdir(this.fixturesDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        id: i + 1,
        name: `${dataType}_${i + 1}`,
        createdAt: new Date().toISOString(),
      });
    }

    const filename = `${dataType}.json`;
    const filePath = path.join(this.fixturesDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully created test data: fixtures/${filename}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
        },
      ],
    };
  }

  async handleAnalyzeTest(filename) {
    const filePath = path.join(this.testsDir, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    
    const analysis = {
      file: filename,
      suggestions: [],
      issues: [],
      bestPractices: [],
    };

    // Simple analysis
    if (!content.includes('test.describe')) {
      analysis.suggestions.push('Consider using test.describe() to group related tests');
    }
    if (content.includes('page.waitForTimeout')) {
      analysis.issues.push('Avoid using page.waitForTimeout() - use proper waitFor methods instead');
    }
    if (!content.includes('expect')) {
      analysis.issues.push('No assertions found - tests should include expect() statements');
    }
    if (content.split('\n').length > 100) {
      analysis.suggestions.push('Test file is long - consider splitting into multiple files');
    }

    const analysisText = `
📊 Test Analysis for ${filename}

${analysis.issues.length > 0 ? `⚠️ Issues Found:\n${analysis.issues.map(i => `  - ${i}`).join('\n')}` : '✅ No major issues found'}

${analysis.suggestions.length > 0 ? `💡 Suggestions:\n${analysis.suggestions.map(s => `  - ${s}`).join('\n')}` : ''}

📝 Test Content:
\`\`\`javascript
${content}
\`\`\`
`;

    return {
      content: [
        {
          type: 'text',
          text: analysisText,
        },
      ],
    };
  }

  async handleGetTestResults(detailed = false) {
    const resultsDir = path.join(this.projectRoot, 'test-results');
    
    try {
      const files = await fs.readdir(resultsDir);
      if (files.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: '📊 No test results found. Run tests first using `run_test`.',
            },
          ],
        };
      }
      
      let resultText = `📊 Test Results (${files.length} result(s)):\n\n`;
      resultText += files.map(f => `  - ${f}`).join('\n');
      
      return {
        content: [
          {
            type: 'text',
            text: resultText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: '📊 No test results found. Run tests first using `run_test`.',
          },
        ],
      };
    }
  }

  async handleShowTrace() {
    try {
      exec('npx playwright show-report', { cwd: this.projectRoot });
      return {
        content: [
          {
            type: 'text',
            text: '✅ Opening test report in browser...',
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to open report: ${error.message}`,
          },
        ],
      };
    }
  }

  async handleGetPlaywrightConfig() {
    const configPath = path.join(this.projectRoot, 'playwright.config.js');
    const content = await fs.readFile(configPath, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: `📝 Playwright Configuration:\n\n\`\`\`javascript\n${content}\n\`\`\``,
        },
      ],
    };
  }

  async handleUpdatePlaywrightConfig(content) {
    const configPath = path.join(this.projectRoot, 'playwright.config.js');
    await fs.writeFile(configPath, content, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: '✅ Successfully updated Playwright configuration',
        },
      ],
    };
  }

  async handleCodegen(url) {
    const command = url ? `npx playwright codegen ${url}` : 'npx playwright codegen';
    try {
      exec(command, { cwd: this.projectRoot });
      return {
        content: [
          {
            type: 'text',
            text: `✅ Playwright Codegen launched! ${url ? `Recording from ${url}` : 'Ready to record'}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to launch codegen: ${error.message}`,
          },
        ],
      };
    }
  }

  async handleInstallBrowsers() {
    try {
      const { stdout, stderr } = await execAsync('npx playwright install', {
        cwd: this.projectRoot,
        maxBuffer: 1024 * 1024 * 10,
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Browser installation completed:\n\n\`\`\`\n${stdout}\n${stderr}\n\`\`\``,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Browser installation failed:\n\n${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Enhanced Playwright MCP AI Agent running on stdio');
  }
}

// Start the server
const server = new EnhancedPlaywrightMCPServer();
server.run().catch(console.error);
