import { AnalyzeFilesParams, AnalyzeDirParams, VerifyFeatureParams, RawPromptParams, ConfigGetParams, ConfigSetParams, GeminiResponse } from './types.js';
export declare class McpMethods {
    private geminiCli;
    constructor();
    /**
     * Analyze multiple files with a given prompt
     */
    analyzeFiles(params: AnalyzeFilesParams): Promise<GeminiResponse>;
    /**
     * Analyze a directory with a given prompt
     */
    analyzeDir(params: AnalyzeDirParams): Promise<GeminiResponse>;
    /**
     * Verify if a feature is implemented in the codebase
     */
    verifyFeature(params: VerifyFeatureParams): Promise<GeminiResponse>;
    /**
     * Execute a raw prompt with gemini CLI
     */
    rawPrompt(params: RawPromptParams): Promise<GeminiResponse>;
    /**
     * Get configuration value
     */
    configGet(params: ConfigGetParams): Promise<GeminiResponse>;
    /**
     * Set configuration value
     */
    configSet(params: ConfigSetParams): Promise<GeminiResponse>;
    /**
     * Build additional flags from options
     */
    private buildAdditionalFlags;
    /**
     * Build verification prompt for feature checking
     */
    private buildVerificationPrompt;
}
//# sourceMappingURL=mcp-methods.d.ts.map