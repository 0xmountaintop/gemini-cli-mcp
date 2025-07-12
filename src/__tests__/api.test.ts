import { createMcpGemini } from '../lib/api';
import { MCP_METHODS } from '../lib/types';

describe('MCP Gemini API', () => {
  let mcpGemini: ReturnType<typeof createMcpGemini>;

  beforeEach(() => {
    mcpGemini = createMcpGemini();
  });

  test('should create MCP Gemini instance', () => {
    expect(mcpGemini).toBeDefined();
    expect(mcpGemini.getSupportedMethods()).toEqual(Object.values(MCP_METHODS));
  });

  test('should handle invalid JSON-RPC request', async () => {
    const response = await mcpGemini.processRequestString('invalid json');
    expect(response).toContain('Parse error');
  });

  test('should handle method not found', async () => {
    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'nonexistent.method',
      params: {}
    };

    const response = await mcpGemini.processRequest(request);
    expect(response.error).toBeDefined();
    expect(response.error?.message).toContain('Method not found');
  });

  test('should handle config.get request', async () => {
    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: MCP_METHODS.CONFIG_GET,
      params: { key: 'geminiPath' }
    };

    const response = await mcpGemini.processRequest(request);
    expect(response.result).toBeDefined();
    const result = response.result as any;
    expect(result.ok).toBe(true);
    expect(result.output).toContain('geminiPath');
  });

  test('should handle config.set request', async () => {
    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: MCP_METHODS.CONFIG_SET,
      params: { key: 'defaultTimeout', value: 120 }
    };

    const response = await mcpGemini.processRequest(request);
    expect(response.result).toBeDefined();
    const result = response.result as any;
    expect(result.ok).toBe(true);
    expect(result.output).toContain('Configuration updated');
  });

  // Skip this test for now as it requires gemini CLI to be installed
  // test('should handle rawPrompt request without gemini CLI', async () => {
  //   const request = {
  //     jsonrpc: '2.0' as const,
  //     id: 1,
  //     method: MCP_METHODS.RAW_PROMPT,
  //     params: { prompt: 'Hello, world!' }
  //   };
  //   const response = await mcpGemini.processRequest(request);
  //   expect(response.result).toBeDefined();
  //   const result = response.result as any;
  //   expect(result.ok).toBe(false);
  //   expect(result.error).toContain('Gemini CLI not found');
  // }, 10000);
}); 