import { McpGemini } from '../lib/api.js';
export declare class StdioServer {
    private mcpGemini;
    constructor(mcpGemini: McpGemini);
    /**
     * Start the JSON-RPC server on stdin/stdout
     */
    start(): Promise<void>;
}
//# sourceMappingURL=stdio-server.d.ts.map