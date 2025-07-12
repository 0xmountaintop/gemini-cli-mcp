import { McpMethods } from './mcp-methods.js';
import { JsonRpcProcessor } from './jsonrpc.js';
import { MCP_METHODS } from './types.js';
import type { JsonRpcRequest, JsonRpcResponse, GeminiResponse } from './types.js';

/**
 * Main API factory function
 */
export function createMcpGemini(): McpGemini {
  return new McpGemini();
}

/**
 * Main MCP Gemini class that handles JSON-RPC requests
 */
export class McpGemini {
  private methods: McpMethods;

  constructor() {
    this.methods = new McpMethods();
  }

  /**
   * Process a JSON-RPC request and return a response
   */
  async processRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    try {
      // Route the request to the appropriate method
      const result = await this.routeRequest(request);
      
      if (result.ok) {
        return JsonRpcProcessor.createSuccessResponse(request.id, result);
      } else {
        return JsonRpcProcessor.createInternalErrorResponse(request.id, result.error);
      }
    } catch (error) {
      return JsonRpcProcessor.createInternalErrorResponse(
        request.id,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Process a JSON-RPC request from string input
   */
  async processRequestString(input: string): Promise<string> {
    try {
      const request = JsonRpcProcessor.parseRequest(input);
      const response = await this.processRequest(request);
      return JsonRpcProcessor.serializeResponse(response);
    } catch (error) {
      const errorResponse = JsonRpcProcessor.createParseErrorResponse();
      return JsonRpcProcessor.serializeResponse(errorResponse);
    }
  }

  /**
   * Route request to appropriate method handler
   */
  private async routeRequest(request: JsonRpcRequest): Promise<GeminiResponse> {
    switch (request.method) {
      case MCP_METHODS.ANALYZE_FILES:
        return this.methods.analyzeFiles(request.params as any);
      
      case MCP_METHODS.ANALYZE_DIR:
        return this.methods.analyzeDir(request.params as any);
      
      case MCP_METHODS.VERIFY_FEATURE:
        return this.methods.verifyFeature(request.params as any);
      
      case MCP_METHODS.RAW_PROMPT:
        return this.methods.rawPrompt(request.params as any);
      
      case MCP_METHODS.CONFIG_GET:
        return this.methods.configGet(request.params as any);
      
      case MCP_METHODS.CONFIG_SET:
        return this.methods.configSet(request.params as any);
      
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
  getSupportedMethods(): string[] {
    return Object.values(MCP_METHODS);
  }
} 