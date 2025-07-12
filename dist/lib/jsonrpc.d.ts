import { JsonRpcRequest, JsonRpcResponse } from './types.js';
export declare const JSON_RPC_ERRORS: {
    readonly PARSE_ERROR: -32700;
    readonly INVALID_REQUEST: -32600;
    readonly METHOD_NOT_FOUND: -32601;
    readonly INVALID_PARAMS: -32602;
    readonly INTERNAL_ERROR: -32603;
};
export declare class JsonRpcProcessor {
    /**
     * Parse a JSON-RPC request from string
     */
    static parseRequest(input: string): JsonRpcRequest;
    /**
     * Validate JSON-RPC request structure
     */
    static isValidRequest(obj: unknown): obj is JsonRpcRequest;
    /**
     * Create a success response
     */
    static createSuccessResponse(id: string | number, result: unknown): JsonRpcResponse;
    /**
     * Create an error response
     */
    static createErrorResponse(id: string | number | null, code: number, message: string, data?: unknown): JsonRpcResponse;
    /**
     * Create a parse error response
     */
    static createParseErrorResponse(): JsonRpcResponse;
    /**
     * Create an invalid request response
     */
    static createInvalidRequestResponse(id?: string | number): JsonRpcResponse;
    /**
     * Create a method not found response
     */
    static createMethodNotFoundResponse(id: string | number, method: string): JsonRpcResponse;
    /**
     * Create an invalid params response
     */
    static createInvalidParamsResponse(id: string | number, message?: string): JsonRpcResponse;
    /**
     * Create an internal error response
     */
    static createInternalErrorResponse(id: string | number, message?: string): JsonRpcResponse;
    /**
     * Serialize response to JSON string
     */
    static serializeResponse(response: JsonRpcResponse): string;
}
//# sourceMappingURL=jsonrpc.d.ts.map