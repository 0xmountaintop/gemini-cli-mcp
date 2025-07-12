import { createReadStream, createWriteStream } from 'fs';
import { createInterface } from 'readline';
import { McpGemini } from '../lib/api.js';

export class StdioServer {
  private mcpGemini: McpGemini;

  constructor(mcpGemini: McpGemini) {
    this.mcpGemini = mcpGemini;
  }

  /**
   * Start the JSON-RPC server on stdin/stdout
   */
  async start(): Promise<void> {
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    console.error('MCP Gemini server started on stdin/stdout');
    console.error('Supported methods:', this.mcpGemini.getSupportedMethods().join(', '));

    readline.on('line', async (line) => {
      try {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Process the JSON-RPC request
        const response = await this.mcpGemini.processRequestString(trimmed);
        
        // Write response to stdout
        console.log(response);
      } catch (error) {
        console.error('Error processing request:', error);
      }
    });

    readline.on('close', () => {
      console.error('MCP Gemini server stopped');
      process.exit(0);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.error('Received SIGINT, shutting down gracefully');
      readline.close();
    });

    process.on('SIGTERM', () => {
      console.error('Received SIGTERM, shutting down gracefully');
      readline.close();
    });

    // Keep the process alive
    return new Promise((resolve) => {
      readline.on('close', resolve);
    });
  }
} 