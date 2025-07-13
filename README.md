# MCP Gemini

A Model Context Protocol (MCP) wrapper for Google Gemini CLI that enables AI IDEs and agents to interact with Gemini through a standardized JSON-RPC interface.

## Overview

MCP Gemini provides a bridge between AI development tools and the Google Gemini CLI, allowing seamless integration of Gemini's large context window capabilities into various AI workflows.

## Features

- **JSON-RPC 2.0 Interface**: Standard protocol for AI tool integration
- **Multiple Analysis Methods**: Support for file, directory, and feature verification
- **Path Resolution**: Automatic handling of relative/absolute paths
- **Configurable Options**: Timeout, output limits, and custom flags
- **CLI and Library**: Use as a standalone CLI or integrate as a library
- **Unix-focused**: Optimized for Unix-like systems

## Prerequisites

- Node.js 16.0.0 or higher
- Google Gemini CLI installed and available in PATH

## Installation

```bash
npm install mcp-gemini
```

Or install globally:

```bash
npm install -g mcp-gemini
```

## Usage

### As a CLI Tool

#### JSON-RPC Server Mode (Default)

Start the MCP server that communicates via stdin/stdout:

```bash
mcp-gemini
# or explicitly
mcp-gemini server
```

The server accepts JSON-RPC 2.0 requests and returns responses. Example request:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "analyzeFiles",
  "params": {
    "paths": ["src/main.ts", "package.json"],
    "prompt": "Explain the project structure and dependencies"
  }
}
```

#### One-Shot Mode

Execute a single command and exit:

```bash
# Analyze specific files
mcp-gemini run -p "Explain this code" --paths src/main.ts src/utils.ts

# Analyze a directory
mcp-gemini run -p "Summarize the architecture" --dir src/

# Raw prompt
mcp-gemini run -p "What are the best practices for TypeScript?"
```

### As a Library

```typescript
import { createMcpGemini, MCP_METHODS } from 'mcp-gemini';

const mcpGemini = createMcpGemini();

// Process a JSON-RPC request
const response = await mcpGemini.processRequest({
  jsonrpc: '2.0',
  id: 1,
  method: MCP_METHODS.ANALYZE_FILES,
  params: {
    paths: ['src/index.ts'],
    prompt: 'Explain this file'
  }
});

console.log(response.result);
```

## MCP Methods

### `analyzeFiles`

Analyze multiple files with a prompt.

**Parameters:**
- `paths`: Array of file paths to analyze
- `prompt`: Question or instruction for analysis
- `options`: Optional configuration (timeout, maxOutputKB, additionalFlags)

**Example:**
```json
{
  "method": "analyzeFiles",
  "params": {
    "paths": ["src/auth.ts", "src/user.ts"],
    "prompt": "How is authentication implemented?",
    "options": {
      "timeout": 120,
      "maxOutputKB": 2048
    }
  }
}
```

### `analyzeDir`

Analyze a directory with a prompt.

**Parameters:**
- `dir`: Directory path to analyze
- `prompt`: Question or instruction for analysis
- `recursive`: Whether to analyze recursively (default: true)
- `options`: Optional configuration

**Example:**
```json
{
  "method": "analyzeDir",
  "params": {
    "dir": "src/components",
    "prompt": "What UI components are available?",
    "recursive": true
  }
}
```

### `verifyFeature`

Verify if a feature is implemented in the codebase.

**Parameters:**
- `featureQuestion`: Question about the feature to verify
- `paths`: Optional specific paths to check (defaults to current directory)
- `options`: Optional configuration

**Example:**
```json
{
  "method": "verifyFeature",
  "params": {
    "featureQuestion": "Is JWT authentication implemented?",
    "paths": ["src/auth/", "src/middleware/"]
  }
}
```

### `rawPrompt`

Execute a raw prompt without file context.

**Parameters:**
- `prompt`: The prompt to execute
- `options`: Optional configuration

**Example:**
```json
{
  "method": "rawPrompt",
  "params": {
    "prompt": "Explain the differences between TypeScript and JavaScript"
  }
}
```

### `config.get` / `config.set`

Get or set configuration values.

**Example:**
```json
{
  "method": "config.get",
  "params": {
    "key": "geminiPath"
  }
}
```

## Configuration Options

- `geminiPath`: Path to the Gemini CLI binary (default: "gemini")
- `defaultTimeout`: Default timeout in seconds (default: 300)
- `defaultMaxOutputKB`: Default maximum output size in KB (default: 1024)
- `defaultFlags`: Default additional flags for Gemini CLI

## Response Format

All methods return a response in this format:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "output": "Analysis result from Gemini...",
    "tokensUsed": 1500
  }
}
```

Or in case of error:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": false,
    "error": "Error message"
  }
}
```

## Integration Examples

### VS Code Extension

```typescript
import { spawn } from 'child_process';

const mcpGemini = spawn('mcp-gemini', [], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send request
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'analyzeFiles',
  params: {
    paths: ['/path/to/file.ts'],
    prompt: 'Explain this code'
  }
};

mcpGemini.stdin.write(JSON.stringify(request) + '\n');

// Handle response
mcpGemini.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log(response.result);
});
```

### Claude/Cursor Integration

The MCP server can be integrated with Claude Desktop or Cursor IDE by configuring it as an MCP server in their respective configuration files.

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-gemini.git
cd mcp-gemini

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

## Mapping to Gemini CLI

This table shows how MCP methods map to Gemini CLI commands:

| MCP Method | Gemini CLI Command |
|------------|-------------------|
| `analyzeFiles` | `gemini -p "@file1 @file2 prompt"` |
| `analyzeDir` | `gemini -p "@dir/ prompt"` |
| `verifyFeature` | `gemini -p "@paths feature-question"` |
| `rawPrompt` | `gemini -p "prompt"` |

## Error Handling

The wrapper handles various error conditions:

- **Gemini CLI not found**: Returns error if `gemini` command is not available
- **Invalid paths**: Validates file/directory existence before processing
- **Timeout**: Configurable timeout for long-running operations
- **Output size limits**: Prevents excessive memory usage
- **JSON-RPC validation**: Proper error responses for malformed requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

ISC License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/mcp-gemini/issues
- Documentation: https://github.com/yourusername/mcp-gemini#readme 