// JSON-RPC 2.0 types
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

// MCP Method parameter types
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

// Gemini CLI options
export interface GeminiOptions {
  timeout?: number; // timeout in seconds
  maxOutputKB?: number; // max output size in KB
  additionalFlags?: string[]; // additional CLI flags
}

// Result types
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

// Internal types
export interface SpawnGeminiOptions {
  timeout?: number;
  maxOutputKB?: number;
  cwd?: string;
}

export interface ResolvedPaths {
  absolute: string[];
  relative: string[];
}

// Configuration storage
export interface ConfigStore {
  geminiPath?: string;
  defaultFlags?: string[];
  defaultTimeout?: number;
  defaultMaxOutputKB?: number;
}

// MCP method names
export const MCP_METHODS = {
  ANALYZE_FILES: 'analyzeFiles',
  ANALYZE_DIR: 'analyzeDir',
  VERIFY_FEATURE: 'verifyFeature',
  RAW_PROMPT: 'rawPrompt',
  CONFIG_GET: 'config.get',
  CONFIG_SET: 'config.set',
} as const;

export type McpMethod = typeof MCP_METHODS[keyof typeof MCP_METHODS]; 