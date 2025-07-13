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

  test('should reflect config changes immediately without instance recreation', async () => {
    // First, get the current geminiPath
    const getRequest = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: MCP_METHODS.CONFIG_GET,
      params: { key: 'geminiPath' }
    };

    const getResponse = await mcpGemini.processRequest(getRequest);
    expect(getResponse.result).toBeDefined();
    const getResult = getResponse.result as any;
    expect(getResult.ok).toBe(true);

    // Set a new geminiPath
    const setRequest = {
      jsonrpc: '2.0' as const,
      id: 2,
      method: MCP_METHODS.CONFIG_SET,
      params: { key: 'geminiPath', value: '/new/path/to/gemini' }
    };

    const setResponse = await mcpGemini.processRequest(setRequest);
    expect(setResponse.result).toBeDefined();
    const setResult = setResponse.result as any;
    expect(setResult.ok).toBe(true);

    // Verify the change is reflected immediately
    const getNewRequest = {
      jsonrpc: '2.0' as const,
      id: 3,
      method: MCP_METHODS.CONFIG_GET,
      params: { key: 'geminiPath' }
    };

    const getNewResponse = await mcpGemini.processRequest(getNewRequest);
    expect(getNewResponse.result).toBeDefined();
    const getNewResult = getNewResponse.result as any;
    expect(getNewResult.ok).toBe(true);
    expect(getNewResult.output).toContain('/new/path/to/gemini');
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