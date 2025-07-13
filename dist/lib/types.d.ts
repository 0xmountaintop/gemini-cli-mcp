export interface JsonRpcRequest {
    jsonrpc: '2.0';
    id: string | number;
    method: string;
    params?: unknown;
}
export interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: unknown;
    error?: JsonRpcError;
}
export interface JsonRpcError {
    code: number;
    message: string;
    data?: unknown;
}
export interface AnalyzeFilesParams {
    paths: string[];
    prompt: string;
    options?: GeminiOptions;
}
export interface AnalyzeDirParams {
    dir: string;
    prompt: string;
    recursive?: boolean;
    options?: GeminiOptions;
}
export interface VerifyFeatureParams {
    paths?: string[];
    featureQuestion: string;
    options?: GeminiOptions;
}
export interface RawPromptParams {
    prompt: string;
    options?: GeminiOptions;
}
export interface ConfigGetParams {
    key: string;
}
export interface ConfigSetParams {
    key: string;
    value: unknown;
}
export interface GeminiOptions {
    timeout?: number;
    maxOutputKB?: number;
    additionalFlags?: string[];
}
export interface GeminiResult {
    ok: true;
    output: string;
    tokensUsed?: number;
}
export interface GeminiError {
    ok: false;
    error: string;
}
export type GeminiResponse = GeminiResult | GeminiError;
export interface SpawnGeminiOptions {
    timeout?: number;
    maxOutputKB?: number;
    cwd?: string;
}
export interface ResolvedPaths {
    absolute: string[];
    relative: string[];
}
export interface ConfigStore {
    geminiPath?: string;
    defaultFlags?: string[];
    defaultTimeout?: number;
    defaultMaxOutputKB?: number;
    environmentVariables?: Record<string, string>;
}
export declare const MCP_METHODS: {
    readonly ANALYZE_FILES: "analyzeFiles";
    readonly ANALYZE_DIR: "analyzeDir";
    readonly VERIFY_FEATURE: "verifyFeature";
    readonly RAW_PROMPT: "rawPrompt";
    readonly CONFIG_GET: "config.get";
    readonly CONFIG_SET: "config.set";
};
export type McpMethod = typeof MCP_METHODS[keyof typeof MCP_METHODS];
//# sourceMappingURL=types.d.ts.map