#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const mcp_server_js_1 = require("./mcp-server.js");
const run_command_js_1 = require("./run-command.js");
const program = new commander_1.Command();
program
    .name('mcp-gemini')
    .description('MCP wrapper for Google Gemini CLI')
    .version('1.0.0');
// Default command - start MCP server on stdin/stdout
program
    .command('server', { isDefault: true })
    .alias('stdio')
    .description('Start MCP server on stdin/stdout (default)')
    .action(async () => {
    const server = new mcp_server_js_1.McpGeminiServer();
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
    const runCommand = new run_command_js_1.RunCommand();
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
//# sourceMappingURL=index.js.map