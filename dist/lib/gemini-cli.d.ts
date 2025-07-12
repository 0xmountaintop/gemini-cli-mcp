import { GeminiResponse, SpawnGeminiOptions, ResolvedPaths } from './types.js';
export declare class GeminiCLI {
    private geminiPath;
    private defaultTimeout;
    private defaultMaxOutputKB;
    constructor(geminiPath?: string, defaultTimeout?: number, defaultMaxOutputKB?: number);
    /**
     * Resolve and validate file/directory paths
     */
    resolvePaths(paths: string[], cwd?: string): Promise<ResolvedPaths>;
    /**
     * Get relative path from cwd to target
     */
    private getRelativePath;
    /**
     * Check if gemini CLI is available
     */
    checkGeminiAvailable(): Promise<boolean>;
    /**
     * Execute gemini CLI with given arguments
     */
    spawnGemini(args: string[], options?: SpawnGeminiOptions): Promise<GeminiResponse>;
    /**
     * Execute gemini CLI using spawn with proper stdin handling
     */
    private spawnGeminiWithStdin;
    /**
     * Build gemini CLI arguments for file/directory analysis
     */
    buildAnalyzeArgs(paths: string[], prompt: string, additionalFlags?: string[]): string[];
    /**
     * Build gemini CLI arguments for directory analysis
     */
    buildAnalyzeDirArgs(dir: string, prompt: string, recursive?: boolean, additionalFlags?: string[]): string[];
    /**
     * Build gemini CLI arguments for raw prompt
     */
    buildRawPromptArgs(prompt: string, additionalFlags?: string[]): string[];
}
//# sourceMappingURL=gemini-cli.d.ts.map