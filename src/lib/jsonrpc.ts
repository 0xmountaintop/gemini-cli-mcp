import { JsonRpcRequest, JsonRpcResponse, JsonRpcError } from './types.js';

// JSON-RPC error codes
export const JSON_RPC_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

export class JsonRpcProcessor {
  /**
   * Parse a JSON-RPC request from string
   */
  static parseRequest(input: string): JsonRpcRequest {
    try {
      const parsed = JSON.parse(input);
      
      if (!this.isValidRequest(parsed)) {
        throw new Error('Invalid JSON-RPC request format');
      }
      
      return parsed as JsonRpcRequest;
    } catch (error) {
      throw new Error(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate JSON-RPC request structure
   */
  static isValidRequest(obj: unknown): obj is JsonRpcRequest {
    if (!obj || typeof obj !== 'object') return false;
    
    const req = obj as Record<string, unknown>;
    
    return (
      req.jsonrpc === '2.0' &&
      typeof req.method === 'string' &&
      (typeof req.id === 'string' || typeof req.id === 'number')
    );
  }

  /**
   * Create a success response
   */
  static createSuccessResponse(id: string | number, result: unknown): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }

  /**
   * Create an error response
   */
  static createErrorResponse(
    id: string | number | null,
    code: number,
    message: string,
    data?: unknown
  ): JsonRpcResponse {
    const error: JsonRpcError = { code, message };
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
  static createParseErrorResponse(): JsonRpcResponse {
    return this.createErrorResponse(
      null,
      JSON_RPC_ERRORS.PARSE_ERROR,
      'Parse error'
    );
  }

  /**
   * Create an invalid request response
   */
  static createInvalidRequestResponse(id?: string | number): JsonRpcResponse {
    return this.createErrorResponse(
      id ?? null,
      JSON_RPC_ERRORS.INVALID_REQUEST,
      'Invalid Request'
    );
  }

  /**
   * Create a method not found response
   */
  static createMethodNotFoundResponse(id: string | number, method: string): JsonRpcResponse {
    return this.createErrorResponse(
      id,
      JSON_RPC_ERRORS.METHOD_NOT_FOUND,
      `Method not found: ${method}`
    );
  }

  /**
   * Create an invalid params response
   */
  static createInvalidParamsResponse(id: string | number, message?: string): JsonRpcResponse {
    return this.createErrorResponse(
      id,
      JSON_RPC_ERRORS.INVALID_PARAMS,
      message || 'Invalid params'
    );
  }

  /**
   * Create an internal error response
   */
  static createInternalErrorResponse(id: string | number, message?: string): JsonRpcResponse {
    return this.createErrorResponse(
      id,
      JSON_RPC_ERRORS.INTERNAL_ERROR,
      message || 'Internal error'
    );
  }

  /**
   * Serialize response to JSON string
   */
  static serializeResponse(response: JsonRpcResponse): string {
    return JSON.stringify(response);
  }
} 