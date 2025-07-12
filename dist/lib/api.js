"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpGemini = void 0;
exports.createMcpGemini = createMcpGemini;
const mcp_methods_js_1 = require("./mcp-methods.js");
const jsonrpc_js_1 = require("./jsonrpc.js");
const types_js_1 = require("./types.js");
/**
 * Main API factory function
 */
function createMcpGemini() {
    return new McpGemini();
}
/**
 * Main MCP Gemini class that handles JSON-RPC requests
 */
class McpGemini {
    constructor() {
        this.methods = new mcp_methods_js_1.McpMethods();
    }
    /**
     * Process a JSON-RPC request and return a response
     */
    async processRequest(request) {
        try {
            // Route the request to the appropriate method
            const result = await this.routeRequest(request);
            if (result.ok) {
                return jsonrpc_js_1.JsonRpcProcessor.createSuccessResponse(request.id, result);
            }
            else {
                return jsonrpc_js_1.JsonRpcProcessor.createInternalErrorResponse(request.id, result.error);
            }
        }
        catch (error) {
            return jsonrpc_js_1.JsonRpcProcessor.createInternalErrorResponse(request.id, error instanceof Error ? error.message : 'Unknown error');
        }
    }
    /**
     * Process a JSON-RPC request from string input
     */
    async processRequestString(input) {
        try {
            const request = jsonrpc_js_1.JsonRpcProcessor.parseRequest(input);
            const response = await this.processRequest(request);
            return jsonrpc_js_1.JsonRpcProcessor.serializeResponse(response);
        }
        catch (error) {
            const errorResponse = jsonrpc_js_1.JsonRpcProcessor.createParseErrorResponse();
            return jsonrpc_js_1.JsonRpcProcessor.serializeResponse(errorResponse);
        }
    }
    /**
     * Route request to appropriate method handler
     */
    async routeRequest(request) {
        switch (request.method) {
            case types_js_1.MCP_METHODS.ANALYZE_FILES:
                return this.methods.analyzeFiles(request.params);
            case types_js_1.MCP_METHODS.ANALYZE_DIR:
                return this.methods.analyzeDir(request.params);
            case types_js_1.MCP_METHODS.VERIFY_FEATURE:
                return this.methods.verifyFeature(request.params);
            case types_js_1.MCP_METHODS.RAW_PROMPT:
                return this.methods.rawPrompt(request.params);
            case types_js_1.MCP_METHODS.CONFIG_GET:
                return this.methods.configGet(request.params);
            case types_js_1.MCP_METHODS.CONFIG_SET:
                return this.methods.configSet(request.params);
            default:
                return {
                    ok: false,
                    error: `Method not found: ${request.method}`
                };
        }
    }
    /**
     * Get list of supported methods
     */
    getSupportedMethods() {
        return Object.values(types_js_1.MCP_METHODS);
    }
}
exports.McpGemini = McpGemini;
//# sourceMappingURL=api.js.map