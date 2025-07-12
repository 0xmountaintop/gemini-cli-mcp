#!/usr/bin/env node

import { Command } from 'commander';
import { createMcpGemini } from '../lib/api.js';
import { StdioServer } from './stdio-server.js';
import { RunCommand } from './run-command.js';

const program = new Command();

program
  .name('mcp-gemini')
  .description('MCP wrapper for Google Gemini CLI')
  .version('1.0.0');

// Default command - start JSON-RPC server on stdin/stdout
program
  .command('server', { isDefault: true })
  .alias('stdio')
  .description('Start JSON-RPC server on stdin/stdout (default)')
  .action(async () => {
    const mcpGemini = createMcpGemini();
    const server = new StdioServer(mcpGemini);
    await server.start();
  });

// One-shot run command
program
  .command('run')
  .description('Execute a single prompt and exit')
  .option('-p, --prompt <prompt>', 'Prompt to execute')
  .option('--paths <paths...>', 'Paths to include (files or directories)')
  .option('--dir <directory>', 'Directory to analyze')
  .option('--recursive', 'Analyze directory recursively', true)
  .option('--timeout <seconds>', 'Timeout in seconds', '60')
  .option('--max-output <kb>', 'Maximum output size in KB', '1024')
  .action(async (options) => {
    const runCommand = new RunCommand();
    await runCommand.execute(options);
  });

// Parse command line arguments
program.parse();

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 