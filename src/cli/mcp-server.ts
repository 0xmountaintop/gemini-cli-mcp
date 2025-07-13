#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { GeminiCLI } from '../lib/gemini-cli.js';
import { config } from '../lib/config.js';

/**
 * MCP-compliant server for Gemini CLI integration
 */
export class McpGeminiServer {
  private server: Server;
  private geminiCli: GeminiCLI;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-gemini',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Gemini CLI - configuration is now read dynamically
    this.geminiCli = new GeminiCLI();

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_files',
            description: 'Analyze multiple files with a given prompt using Gemini CLI',
            inputSchema: {
              type: 'object',
              properties: {
                paths: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of file paths to analyze',
                },
                prompt: {
                  type: 'string',
                  description: 'Question or instruction for analysis',
                },
                timeout: {
                  type: 'number',
                  description: 'Timeout in seconds (optional)',
                  default: 300,
                },
                maxOutputKB: {
                  type: 'number',
                  description: 'Maximum output size in KB (optional)',
                  default: 1024,
                },
              },
              required: ['paths', 'prompt'],
            },
          },
          {
            name: 'analyze_directory',
            description: 'Analyze a directory with a given prompt using Gemini CLI',
            inputSchema: {
              type: 'object',
              properties: {
                dir: {
                  type: 'string',
                  description: 'Directory path to analyze',
                },
                prompt: {
                  type: 'string',
                  description: 'Question or instruction for analysis',
                },
                recursive: {
                  type: 'boolean',
                  description: 'Whether to analyze recursively',
                  default: true,
                },
                timeout: {
                  type: 'number',
                  description: 'Timeout in seconds (optional)',
                  default: 300,
                },
                maxOutputKB: {
                  type: 'number',
                  description: 'Maximum output size in KB (optional)',
                  default: 1024,
                },
              },
              required: ['dir', 'prompt'],
            },
          },
          {
            name: 'verify_feature',
            description: 'Verify if a feature is implemented in the codebase',
            inputSchema: {
              type: 'object',
              properties: {
                featureQuestion: {
                  type: 'string',
                  description: 'Question about the feature to verify',
                },
                paths: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Optional specific paths to check',
                },
                timeout: {
                  type: 'number',
                  description: 'Timeout in seconds (optional)',
                  default: 300,
                },
                maxOutputKB: {
                  type: 'number',
                  description: 'Maximum output size in KB (optional)',
                  default: 1024,
                },
              },
              required: ['featureQuestion'],
            },
          },
          {
            name: 'raw_prompt',
            description: 'Execute a raw prompt without file context using Gemini CLI',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'The prompt to execute',
                },
                timeout: {
                  type: 'number',
                  description: 'Timeout in seconds (optional)',
                  default: 300,
                },
                maxOutputKB: {
                  type: 'number',
                  description: 'Maximum output size in KB (optional)',
                  default: 1024,
                },
              },
              required: ['prompt'],
            },
          },
          {
            name: 'get_config',
            description: 'Get configuration value',
            inputSchema: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  description: 'Configuration key to retrieve',
                },
              },
              required: ['key'],
            },
          },
          {
            name: 'set_config',
            description: 'Set configuration value',
            inputSchema: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  description: 'Configuration key to set',
                },
                value: {
                  type: 'string',
                  description: 'Configuration value to set',
                },
              },
              required: ['key', 'value'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_files':
            return await this.handleAnalyzeFiles(args);
          case 'analyze_directory':
            return await this.handleAnalyzeDirectory(args);
          case 'verify_feature':
            return await this.handleVerifyFeature(args);
          case 'raw_prompt':
            return await this.handleRawPrompt(args);
          case 'get_config':
            return await this.handleGetConfig(args);
          case 'set_config':
            return await this.handleSetConfig(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async handleAnalyzeFiles(args: any) {
    const { paths, prompt, timeout = 300, maxOutputKB = 1024 } = args;

    if (!Array.isArray(paths) || paths.length === 0) {
      throw new McpError(ErrorCode.InvalidParams, 'paths must be a non-empty array');
    }

    if (!prompt || typeof prompt !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'prompt must be a non-empty string');
    }

    // Resolve and validate paths
    const resolvedPaths = await this.geminiCli.resolvePaths(paths);
    
    // Build arguments
    const geminiArgs = this.geminiCli.buildAnalyzeArgs(
      resolvedPaths.absolute,
      prompt,
      []
    );

    // Execute gemini CLI
    const result = await this.geminiCli.spawnGemini(geminiArgs, {
      timeout,
      maxOutputKB,
    });

    if (!result.ok) {
      throw new McpError(ErrorCode.InternalError, result.error || 'Unknown error');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output,
        },
      ],
    };
  }

  private async handleAnalyzeDirectory(args: any) {
    const { dir, prompt, recursive = true, timeout = 300, maxOutputKB = 1024 } = args;

    if (!dir || typeof dir !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'dir must be a non-empty string');
    }

    if (!prompt || typeof prompt !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'prompt must be a non-empty string');
    }

    // Build arguments
    const geminiArgs = this.geminiCli.buildAnalyzeDirArgs(
      dir,
      prompt,
      recursive,
      []
    );

    // Execute gemini CLI
    const result = await this.geminiCli.spawnGemini(geminiArgs, {
      timeout,
      maxOutputKB,
    });

    if (!result.ok) {
      throw new McpError(ErrorCode.InternalError, result.error || 'Unknown error');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output,
        },
      ],
    };
  }

  private async handleVerifyFeature(args: any) {
    const { featureQuestion, paths, timeout = 300, maxOutputKB = 1024 } = args;

    if (!featureQuestion || typeof featureQuestion !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'featureQuestion must be a non-empty string');
    }

    // Build the verification prompt
    const verificationPrompt = `Please analyze the codebase and verify: ${featureQuestion}

Provide a clear answer about whether this feature is implemented, and if so, where and how it's implemented. If not implemented, explain what would be needed to implement it.`;

    let geminiArgs: string[];

    if (paths && Array.isArray(paths) && paths.length > 0) {
      // Analyze specific paths
      const resolvedPaths = await this.geminiCli.resolvePaths(paths);
      geminiArgs = this.geminiCli.buildAnalyzeArgs(
        resolvedPaths.absolute,
        verificationPrompt,
        []
      );
    } else {
      // Analyze current directory
      geminiArgs = this.geminiCli.buildAnalyzeDirArgs(
        '.',
        verificationPrompt,
        true,
        []
      );
    }

    // Execute gemini CLI
    const result = await this.geminiCli.spawnGemini(geminiArgs, {
      timeout,
      maxOutputKB,
    });

    if (!result.ok) {
      throw new McpError(ErrorCode.InternalError, result.error || 'Unknown error');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output,
        },
      ],
    };
  }

  private async handleRawPrompt(args: any) {
    const { prompt, timeout = 300, maxOutputKB = 1024 } = args;

    if (!prompt || typeof prompt !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'prompt must be a non-empty string');
    }

    // Build arguments
    const geminiArgs = this.geminiCli.buildRawPromptArgs(prompt, []);

    // Execute gemini CLI
    const result = await this.geminiCli.spawnGemini(geminiArgs, {
      timeout,
      maxOutputKB,
    });

    if (!result.ok) {
      throw new McpError(ErrorCode.InternalError, result.error || 'Unknown error');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output,
        },
      ],
    };
  }

  private async handleGetConfig(args: any) {
    const { key } = args;

    if (!key || typeof key !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'key must be a non-empty string');
    }

    const value = config.get(key);
    
    return {
      content: [
        {
          type: 'text',
          text: `Configuration ${key}: ${JSON.stringify(value)}`,
        },
      ],
    };
  }

  private async handleSetConfig(args: any) {
    const { key, value } = args;

    if (!key || typeof key !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'key must be a non-empty string');
    }

    config.set(key, value);
    
    return {
      content: [
        {
          type: 'text',
          text: `Configuration updated: ${key} = ${JSON.stringify(value)}`,
        },
      ],
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Gemini server started on stdin/stdout');
  }
} 