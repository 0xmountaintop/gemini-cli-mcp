#!/usr/bin/env node
/**
 * MCP-compliant server for Gemini CLI integration
 */
export declare class McpGeminiServer {
    private server;
    private geminiCli;
    constructor();
    private setupHandlers;
    private handleAnalyzeFiles;
    private handleAnalyzeDirectory;
    private handleVerifyFeature;
    private handleRawPrompt;
    private handleGetConfig;
    private handleSetConfig;
    start(): Promise<void>;
}
//# sourceMappingURL=mcp-server.d.ts.map