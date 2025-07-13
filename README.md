# MCP Gemini

A Model Context Protocol (MCP) wrapper for Google Gemini CLI that enables AI IDEs and agents to interact with Gemini through a standardized JSON-RPC interface. This MCP tool borrows the idea from https://www.reddit.com/r/ChatGPTCoding/comments/1lm3fxq/gemini_cli_is_awesome_but_only_when_you_make/.

## Overview

MCP Gemini provides a bridge between AI development tools and the Google Gemini CLI, allowing seamless integration of Gemini's large context window capabilities into various AI workflows.

## Prerequisites

- Node.js 16.0.0 or higher
- Google Gemini CLI installed and available

## How to use
mcp configuration
```json
{
  "mcpServers": {
    "gemini": {
      "command": "npx",
        "args": ["-y", "mcp-gemini"],
        "env": {
          "GEMINI_CLI_PATH": <YOUR_GEMINI_CLI_PATH>, //Optional, but it's better to set it.
          "GEMINI_API_KEY": <YOUR_GEMINI_API_KEY> // Optional if you use oauth
      }
    }
  }
}
```

## Available tools
+ `analyze_files` - Analyze multiple files with Gemini CLI
+ `analyze_directory` - Analyze directories with Gemini CLI
+ `verify_feature` - Verify feature implementation in codebase
+ `raw_prompt` - Execute raw prompts without file context
+ `get_config` / `set_config` - Configuration management, supporting config:
  + `geminiPath`
  + `defaultTimeout`
  + `defaultMaxOutputKB`
  + `defaultFlags`

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
- GitHub Issues: https://github.com/0xmountaintop/gemini-cli-mcp/issues
- Documentation: https://github.com/0xmountaintop/gemini-cli-mcp/blob/master/DOCUMENTATION.md
 