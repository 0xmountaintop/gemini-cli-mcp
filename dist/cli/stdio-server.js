"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StdioServer = void 0;
const readline_1 = require("readline");
class StdioServer {
    constructor(mcpGemini) {
        this.mcpGemini = mcpGemini;
    }
    /**
     * Start the JSON-RPC server on stdin/stdout
     */
    async start() {
        const readline = (0, readline_1.createInterface)({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
        console.error('MCP Gemini server started on stdin/stdout');
        console.error('Supported methods:', this.mcpGemini.getSupportedMethods().join(', '));
        readline.on('line', async (line) => {
            try {
                const trimmed = line.trim();
                if (!trimmed)
                    return;
                // Process the JSON-RPC request
                const response = await this.mcpGemini.processRequestString(trimmed);
                // Write response to stdout
                console.log(response);
            }
            catch (error) {
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
exports.StdioServer = StdioServer;
//# sourceMappingURL=stdio-server.js.map