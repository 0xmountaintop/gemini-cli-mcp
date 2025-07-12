import type { JsonRpcRequest, JsonRpcResponse } from './types.js';
/**
 * Main API factory function
 */
export declare function createMcpGemini(): McpGemini;
/**
 * Main MCP Gemini class that handles JSON-RPC requests
 */
export declare class McpGemini {
    private methods;
    constructor();
    /**
     * Process a JSON-RPC request and return a response
     */
    processRequest(request: JsonRpcRequest): Promise<JsonRpcResponse>;
    /**
     * Process a JSON-RPC request from string input
     */
    processRequestString(input: string): Promise<string>;
    /**
     * Route request to appropriate method handler
     */
    private routeRequest;
    /**
     * Get list of supported methods
     */
    getSupportedMethods(): string[];
}
//# sourceMappingURL=api.d.ts.map