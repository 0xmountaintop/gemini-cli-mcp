import { createMcpGemini } from '../lib/api.js';
import { MCP_METHODS } from '../lib/types.js';

interface RunOptions {
  prompt?: string;
  paths?: string[];
  dir?: string;
  recursive?: boolean;
  timeout?: string;
  maxOutput?: string;
}

export class RunCommand {
  /**
   * Execute a one-shot command
   */
  async execute(options: RunOptions): Promise<void> {
    try {
      if (!options.prompt) {
        console.error('Error: --prompt is required');
        process.exit(1);
      }

      const mcpGemini = createMcpGemini();
      
      // Parse numeric options
      const timeout = options.timeout ? parseInt(options.timeout, 10) : 300;
      const maxOutputKB = options.maxOutput ? parseInt(options.maxOutput, 10) : 1024;

      let result;

      // Determine which method to use based on options
      if (options.paths && options.paths.length > 0) {
        // Analyze specific files
        result = await mcpGemini.processRequest({
          jsonrpc: '2.0',
          id: 1,
          method: MCP_METHODS.ANALYZE_FILES,
          params: {
            paths: options.paths,
            prompt: options.prompt,
            options: {
              timeout,
              maxOutputKB
            }
          }
        });
      } else if (options.dir) {
        // Analyze directory
        result = await mcpGemini.processRequest({
          jsonrpc: '2.0',
          id: 1,
          method: MCP_METHODS.ANALYZE_DIR,
          params: {
            dir: options.dir,
            prompt: options.prompt,
            recursive: options.recursive !== false,
            options: {
              timeout,
              maxOutputKB
            }
          }
        });
      } else {
        // Raw prompt
        result = await mcpGemini.processRequest({
          jsonrpc: '2.0',
          id: 1,
          method: MCP_METHODS.RAW_PROMPT,
          params: {
            prompt: options.prompt,
            options: {
              timeout,
              maxOutputKB
            }
          }
        });
      }

      // Output the result
      if (result.error) {
        console.error('Error:', result.error.message);
        process.exit(1);
      } else if (result.result) {
        const geminiResult = result.result as any;
        if (geminiResult.ok) {
          console.log(geminiResult.output);
        } else {
          console.error('Gemini Error:', geminiResult.error);
          process.exit(1);
        }
      }

    } catch (error) {
      console.error('Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }
} 