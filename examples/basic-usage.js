#!/usr/bin/env node

// Example: Basic usage of MCP Gemini library
// This demonstrates how to use the library programmatically

const { createMcpGemini, MCP_METHODS } = require('../dist/lib/index.js');

async function demonstrateBasicUsage() {
  console.log('🚀 MCP Gemini Basic Usage Example\n');

  // Create MCP Gemini instance
  const mcpGemini = createMcpGemini();

  console.log('📋 Supported methods:', mcpGemini.getSupportedMethods().join(', '));
  console.log('');

  // Example 1: Get configuration
  console.log('📖 Example 1: Get configuration');
  const configRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: MCP_METHODS.CONFIG_GET,
    params: { key: 'geminiPath' }
  };

  try {
    const configResponse = await mcpGemini.processRequest(configRequest);
    console.log('Response:', JSON.stringify(configResponse, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 2: Set configuration
  console.log('📝 Example 2: Set configuration');
  const setConfigRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: MCP_METHODS.CONFIG_SET,
    params: { key: 'defaultTimeout', value: 120 }
  };

  try {
    const setConfigResponse = await mcpGemini.processRequest(setConfigRequest);
    console.log('Response:', JSON.stringify(setConfigResponse, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 3: Analyze files (will fail without gemini CLI)
  console.log('📁 Example 3: Analyze files (will fail without gemini CLI)');
  const analyzeRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: MCP_METHODS.ANALYZE_FILES,
    params: {
      paths: ['package.json', 'README.md'],
      prompt: 'What is this project about?'
    }
  };

  try {
    const analyzeResponse = await mcpGemini.processRequest(analyzeRequest);
    console.log('Response:', JSON.stringify(analyzeResponse, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 4: Process JSON-RPC string
  console.log('🔄 Example 4: Process JSON-RPC string');
  const jsonRpcString = JSON.stringify({
    jsonrpc: '2.0',
    id: 4,
    method: MCP_METHODS.RAW_PROMPT,
    params: { prompt: 'Hello, Gemini!' }
  });

  try {
    const stringResponse = await mcpGemini.processRequestString(jsonRpcString);
    console.log('Response:', stringResponse);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n✅ Basic usage demonstration complete!');
}

// Run the example
if (require.main === module) {
  demonstrateBasicUsage().catch(console.error);
}

module.exports = { demonstrateBasicUsage }; 