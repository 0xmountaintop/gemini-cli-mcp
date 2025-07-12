"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunCommand = void 0;
const api_js_1 = require("../lib/api.js");
const types_js_1 = require("../lib/types.js");
class RunCommand {
    /**
     * Execute a one-shot command
     */
    async execute(options) {
        try {
            if (!options.prompt) {
                console.error('Error: --prompt is required');
                process.exit(1);
            }
            const mcpGemini = (0, api_js_1.createMcpGemini)();
            // Parse numeric options
            const timeout = options.timeout ? parseInt(options.timeout, 10) : 60;
            const maxOutputKB = options.maxOutput ? parseInt(options.maxOutput, 10) : 1024;
            let result;
            // Determine which method to use based on options
            if (options.paths && options.paths.length > 0) {
                // Analyze specific files
                result = await mcpGemini.processRequest({
                    jsonrpc: '2.0',
                    id: 1,
                    method: types_js_1.MCP_METHODS.ANALYZE_FILES,
                    params: {
                        paths: options.paths,
                        prompt: options.prompt,
                        options: {
                            timeout,
                            maxOutputKB
                        }
                    }
                });
            }
            else if (options.dir) {
                // Analyze directory
                result = await mcpGemini.processRequest({
                    jsonrpc: '2.0',
                    id: 1,
                    method: types_js_1.MCP_METHODS.ANALYZE_DIR,
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
            }
            else {
                // Raw prompt
                result = await mcpGemini.processRequest({
                    jsonrpc: '2.0',
                    id: 1,
                    method: types_js_1.MCP_METHODS.RAW_PROMPT,
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
            }
            else if (result.result) {
                const geminiResult = result.result;
                if (geminiResult.ok) {
                    console.log(geminiResult.output);
                }
                else {
                    console.error('Gemini Error:', geminiResult.error);
                    process.exit(1);
                }
            }
        }
        catch (error) {
            console.error('Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    }
}
exports.RunCommand = RunCommand;
//# sourceMappingURL=run-command.js.map