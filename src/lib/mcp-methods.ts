import { GeminiCLI } from './gemini-cli.js';
import { config } from './config.js';
import {
  AnalyzeFilesParams,
  AnalyzeDirParams,
  VerifyFeatureParams,
  RawPromptParams,
  ConfigGetParams,
  ConfigSetParams,
  GeminiResponse,
  GeminiOptions,
} from './types.js';

export class McpMethods {
  private geminiCli: GeminiCLI;

  constructor() {
    // GeminiCLI now reads configuration dynamically, no need to pass config values
    this.geminiCli = new GeminiCLI();
  }

  /**
   * Analyze multiple files with a given prompt
   */
  async analyzeFiles(params: AnalyzeFilesParams): Promise<GeminiResponse> {
    try {
      // Validate parameters
      if (!params.paths || !Array.isArray(params.paths) || params.paths.length === 0) {
        return {
          ok: false,
          error: 'Missing or empty paths array'
        };
      }

      if (!params.prompt || typeof params.prompt !== 'string') {
        return {
          ok: false,
          error: 'Missing or invalid prompt'
        };
      }

      // Resolve and validate paths
      const resolvedPaths = await this.geminiCli.resolvePaths(params.paths);
      
      // Build arguments using relative paths (what gemini CLI expects)
      const additionalFlags = this.buildAdditionalFlags(params.options);
      const args = this.geminiCli.buildAnalyzeArgs(
        resolvedPaths.relative,
        params.prompt,
        additionalFlags
      );

      // Execute gemini CLI
      return await this.geminiCli.spawnGemini(args, {
        timeout: params.options?.timeout,
        maxOutputKB: params.options?.maxOutputKB,
      });

    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error in analyzeFiles'
      };
    }
  }

  /**
   * Analyze a directory with a given prompt
   */
  async analyzeDir(params: AnalyzeDirParams): Promise<GeminiResponse> {
    try {
      // Validate parameters
      if (!params.dir || typeof params.dir !== 'string') {
        return {
          ok: false,
          error: 'Missing or invalid directory path'
        };
      }

      if (!params.prompt || typeof params.prompt !== 'string') {
        return {
          ok: false,
          error: 'Missing or invalid prompt'
        };
      }

      // Resolve and validate directory path
      const resolvedPaths = await this.geminiCli.resolvePaths([params.dir]);
      const dirPath = resolvedPaths.relative[0];

      // Build arguments
      const additionalFlags = this.buildAdditionalFlags(params.options);
      const args = this.geminiCli.buildAnalyzeDirArgs(
        dirPath,
        params.prompt,
        params.recursive !== false, // default to true
        additionalFlags
      );

      // Execute gemini CLI
      return await this.geminiCli.spawnGemini(args, {
        timeout: params.options?.timeout,
        maxOutputKB: params.options?.maxOutputKB,
      });

    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error in analyzeDir'
      };
    }
  }

  /**
   * Verify if a feature is implemented in the codebase
   */
  async verifyFeature(params: VerifyFeatureParams): Promise<GeminiResponse> {
    try {
      // Validate parameters
      if (!params.featureQuestion || typeof params.featureQuestion !== 'string') {
        return {
          ok: false,
          error: 'Missing or invalid feature question'
        };
      }

      // Build the verification prompt
      const verificationPrompt = this.buildVerificationPrompt(params.featureQuestion);

      // If paths are provided, analyze specific files/directories
      if (params.paths && params.paths.length > 0) {
        const resolvedPaths = await this.geminiCli.resolvePaths(params.paths);
        const additionalFlags = this.buildAdditionalFlags(params.options);
        const args = this.geminiCli.buildAnalyzeArgs(
          resolvedPaths.relative,
          verificationPrompt,
          additionalFlags
        );

        return await this.geminiCli.spawnGemini(args, {
          timeout: params.options?.timeout,
          maxOutputKB: params.options?.maxOutputKB,
        });
      } else {
        // Analyze current directory if no paths specified
        const additionalFlags = this.buildAdditionalFlags(params.options);
        const args = this.geminiCli.buildAnalyzeDirArgs(
          '.',
          verificationPrompt,
          true,
          additionalFlags
        );

        return await this.geminiCli.spawnGemini(args, {
          timeout: params.options?.timeout,
          maxOutputKB: params.options?.maxOutputKB,
        });
      }

    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error in verifyFeature'
      };
    }
  }

  /**
   * Execute a raw prompt with gemini CLI
   */
  async rawPrompt(params: RawPromptParams): Promise<GeminiResponse> {
    try {
      // Validate parameters
      if (!params.prompt || typeof params.prompt !== 'string') {
        return {
          ok: false,
          error: 'Missing or invalid prompt'
        };
      }

      // Build arguments
      const additionalFlags = this.buildAdditionalFlags(params.options);
      const args = this.geminiCli.buildRawPromptArgs(params.prompt, additionalFlags);

      // Execute gemini CLI
      return await this.geminiCli.spawnGemini(args, {
        timeout: params.options?.timeout,
        maxOutputKB: params.options?.maxOutputKB,
      });

    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error in rawPrompt'
      };
    }
  }

  /**
   * Get configuration value
   */
  async configGet(params: ConfigGetParams): Promise<GeminiResponse> {
    try {
      if (!params.key || typeof params.key !== 'string') {
        return {
          ok: false,
          error: 'Missing or invalid configuration key'
        };
      }

      const value = config.get(params.key);
      
      return {
        ok: true,
        output: JSON.stringify({ key: params.key, value }, null, 2)
      };

    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error in configGet'
      };
    }
  }

  /**
   * Set configuration value
   */
  async configSet(params: ConfigSetParams): Promise<GeminiResponse> {
    try {
      if (!params.key || typeof params.key !== 'string') {
        return {
          ok: false,
          error: 'Missing or invalid configuration key'
        };
      }

      config.set(params.key, params.value);
      
      return {
        ok: true,
        output: `Configuration updated: ${params.key} = ${JSON.stringify(params.value)}`
      };

    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error in configSet'
      };
    }
  }

  /**
   * Build additional flags from options
   */
  private buildAdditionalFlags(options?: GeminiOptions): string[] {
    const flags: string[] = [];
    
    if (options?.additionalFlags) {
      flags.push(...options.additionalFlags);
    }
    
    // Add default flags from config
    const defaultFlags = config.get('defaultFlags') as string[];
    if (defaultFlags && defaultFlags.length > 0) {
      flags.push(...defaultFlags);
    }
    
    return flags;
  }

  /**
   * Build verification prompt for feature checking
   */
  private buildVerificationPrompt(featureQuestion: string): string {
    // Enhance the user's question to make it more specific for verification
    const enhancedPrompt = `${featureQuestion}

Please analyze the codebase and provide a detailed answer including:
1. Whether the feature is implemented (Yes/No)
2. If implemented, show the relevant files and functions
3. If not implemented, explain what would be needed
4. Include code examples where applicable`;

    return enhancedPrompt;
  }
} 