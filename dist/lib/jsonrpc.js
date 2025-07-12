"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcProcessor = exports.JSON_RPC_ERRORS = void 0;
// JSON-RPC error codes
exports.JSON_RPC_ERRORS = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
};
class JsonRpcProcessor {
    /**
     * Parse a JSON-RPC request from string
     */
    static parseRequest(input) {
        try {
            const parsed = JSON.parse(input);
            if (!this.isValidRequest(parsed)) {
                throw new Error('Invalid JSON-RPC request format');
            }
            return parsed;
        }
        catch (error) {
            throw new Error(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Validate JSON-RPC request structure
     */
    static isValidRequest(obj) {
        if (!obj || typeof obj !== 'object')
            return false;
        const req = obj;
        return (req.jsonrpc === '2.0' &&
            typeof req.method === 'string' &&
            (typeof req.id === 'string' || typeof req.id === 'number'));
    }
    /**
     * Create a success response
     */
    static createSuccessResponse(id, result) {
        return {
            jsonrpc: '2.0',
            id,
            result,
        };
    }
    /**
     * Create an error response
     */
    static createErrorResponse(id, code, message, data) {
        const error = { code, message };
        if (data !== undefined) {
            error.data = data;
        }
        return {
            jsonrpc: '2.0',
            id: id ?? 0,
            error,
        };
    }
    /**
     * Create a parse error response
     */
    static createParseErrorResponse() {
        return this.createErrorResponse(null, exports.JSON_RPC_ERRORS.PARSE_ERROR, 'Parse error');
    }
    /**
     * Create an invalid request response
     */
    static createInvalidRequestResponse(id) {
        return this.createErrorResponse(id ?? null, exports.JSON_RPC_ERRORS.INVALID_REQUEST, 'Invalid Request');
    }
    /**
     * Create a method not found response
     */
    static createMethodNotFoundResponse(id, method) {
        return this.createErrorResponse(id, exports.JSON_RPC_ERRORS.METHOD_NOT_FOUND, `Method not found: ${method}`);
    }
    /**
     * Create an invalid params response
     */
    static createInvalidParamsResponse(id, message) {
        return this.createErrorResponse(id, exports.JSON_RPC_ERRORS.INVALID_PARAMS, message || 'Invalid params');
    }
    /**
     * Create an internal error response
     */
    static createInternalErrorResponse(id, message) {
        return this.createErrorResponse(id, exports.JSON_RPC_ERRORS.INTERNAL_ERROR, message || 'Internal error');
    }
    /**
     * Serialize response to JSON string
     */
    static serializeResponse(response) {
        return JSON.stringify(response);
    }
}
exports.JsonRpcProcessor = JsonRpcProcessor;
//# sourceMappingURL=jsonrpc.js.map