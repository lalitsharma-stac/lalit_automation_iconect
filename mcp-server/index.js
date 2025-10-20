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

class PlaywrightMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'playwright-automation-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.projectRoot = path.resolve(__dirname, '..');
    this.testsDir = path.join(this.projectRoot, 'tests');
    
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
          name: 'run_test',
          description: 'Run a specific Playwright test or all tests',
          inputSchema: {
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                description: 'Name of the test file to run (optional, runs all if not specified)',
              },
              headed: {
                type: 'boolean',
                description: 'Run tests in headed mode (visible browser)',
                default: false,
              },
            },
          },
        },
        {
          name: 'create_test',
          description: 'Create a new Playwright test file',
          inputSchema: {
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                description: 'Name of the new test file (e.g., login.spec.js)',
              },
              content: {
                type: 'string',
                description: 'Content of the test file',
              },
            },
            required: ['filename', 'content'],
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
        {
          name: 'get_test_results',
          description: 'Get the latest test results from the test-results directory',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_playwright_config',
          description: 'Read the Playwright configuration file',
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
          
          case 'run_test':
            return await this.handleRunTest(args.filename, args.headed);
          
          case 'create_test':
            return await this.handleCreateTest(args.filename, args.content);
          
          case 'update_test':
            return await this.handleUpdateTest(args.filename, args.content);
          
          case 'get_test_results':
            return await this.handleGetTestResults();
          
          case 'get_playwright_config':
            return await this.handleGetPlaywrightConfig();
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async listTests() {
    const files = await fs.readdir(this.testsDir);
    return files.filter(file => file.endsWith('.spec.js') || file.endsWith('.test.js'));
  }

  async handleListTests() {
    const tests = await this.listTests();
    return {
      content: [
        {
          type: 'text',
          text: `Found ${tests.length} test file(s):\n${tests.map(t => `- ${t}`).join('\n')}`,
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
          text: `Content of ${filename}:\n\n${content}`,
        },
      ],
    };
  }

  async handleRunTest(filename, headed = false) {
    const headedFlag = headed ? '--headed' : '';
    const testPath = filename ? path.join('tests', filename) : '';
    const command = `npx playwright test ${testPath} ${headedFlag}`.trim();
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Test execution completed:\n\n${stdout}\n${stderr}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Test execution failed:\n\n${error.stdout}\n${error.stderr}\n\nError: ${error.message}`,
          },
        ],
      };
    }
  }

  async handleCreateTest(filename, content) {
    const filePath = path.join(this.testsDir, filename);
    
    // Check if file already exists
    try {
      await fs.access(filePath);
      throw new Error(`Test file ${filename} already exists`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    await fs.writeFile(filePath, content, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: `Successfully created test file: ${filename}`,
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
          text: `Successfully updated test file: ${filename}`,
        },
      ],
    };
  }

  async handleGetTestResults() {
    const resultsDir = path.join(this.projectRoot, 'test-results');
    
    try {
      const files = await fs.readdir(resultsDir);
      if (files.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No test results found. Run tests first.',
            },
          ],
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Test results directory contains:\n${files.map(f => `- ${f}`).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: 'No test results found. Run tests first.',
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
          text: `Playwright Configuration:\n\n${content}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Playwright MCP Server running on stdio');
  }
}

// Start the server
const server = new PlaywrightMCPServer();
server.run().catch(console.error);
