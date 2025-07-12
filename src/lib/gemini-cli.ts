import { execFile } from 'child_process';
import { promisify } from 'util';
import { resolve, dirname, isAbsolute } from 'path';
import { stat, access } from 'fs/promises';
import { constants } from 'fs';
import { GeminiResponse, GeminiResult, GeminiError, SpawnGeminiOptions, ResolvedPaths } from './types.js';

const execFileAsync = promisify(execFile);

export class GeminiCLI {
  private geminiPath: string;
  private defaultTimeout: number;
  private defaultMaxOutputKB: number;

  constructor(
    geminiPath = 'gemini',
    defaultTimeout = 60,
    defaultMaxOutputKB = 1024
  ) {
    this.geminiPath = geminiPath;
    this.defaultTimeout = defaultTimeout;
    this.defaultMaxOutputKB = defaultMaxOutputKB;
  }

  /**
   * Resolve and validate file/directory paths
   */
  async resolvePaths(paths: string[], cwd: string = process.cwd()): Promise<ResolvedPaths> {
    const resolved: ResolvedPaths = {
      absolute: [],
      relative: []
    };

    for (const path of paths) {
      try {
        // Convert to absolute path
        const absolutePath = isAbsolute(path) ? path : resolve(cwd, path);
        
        // Check if path exists
        await access(absolutePath, constants.F_OK);
        
        // Get stats to verify it's a file or directory
        const stats = await stat(absolutePath);
        if (!stats.isFile() && !stats.isDirectory()) {
          throw new Error(`Path is neither file nor directory: ${path}`);
        }

        resolved.absolute.push(absolutePath);
        
        // For gemini CLI, we need relative paths from cwd
        // Since we're running gemini from cwd, we can use the original path if it's relative
        // or calculate relative path if it's absolute
        const relativePath = isAbsolute(path) ? 
          this.getRelativePath(cwd, absolutePath) : 
          path;
        
        resolved.relative.push(relativePath);
      } catch (error) {
        throw new Error(`Invalid path '${path}': ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return resolved;
  }

  /**
   * Get relative path from cwd to target
   */
  private getRelativePath(cwd: string, target: string): string {
    // Simple relative path calculation
    // For more complex cases, you might want to use path.relative()
    if (target.startsWith(cwd)) {
      const rel = target.substring(cwd.length);
      return rel.startsWith('/') ? rel.substring(1) : rel;
    }
    return target;
  }

  /**
   * Check if gemini CLI is available
   */
  async checkGeminiAvailable(): Promise<boolean> {
    try {
      await execFileAsync(this.geminiPath, ['--version'], { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute gemini CLI with given arguments
   */
  async spawnGemini(args: string[], options: SpawnGeminiOptions = {}): Promise<GeminiResponse> {
    const timeout = (options.timeout || this.defaultTimeout) * 1000; // Convert to ms
    const maxOutputKB = options.maxOutputKB || this.defaultMaxOutputKB;
    const cwd = options.cwd || process.cwd();

    try {
      // Check if gemini is available
      if (!(await this.checkGeminiAvailable())) {
        return {
          ok: false,
          error: `Gemini CLI not found at '${this.geminiPath}'. Please ensure it's installed and in PATH.`
        };
      }

      const { stdout, stderr } = await execFileAsync(
        this.geminiPath,
        args,
        {
          timeout,
          cwd,
          maxBuffer: maxOutputKB * 1024, // Convert KB to bytes
          encoding: 'utf8'
        }
      );

      // If there's stderr content, include it in the response
      const output = stdout + (stderr ? `\n[stderr]: ${stderr}` : '');

      return {
        ok: true,
        output: output.trim(),
        // Note: We don't have direct access to token usage from gemini CLI
        // This would need to be parsed from output if available
      };

    } catch (error) {
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        if ('code' in error && error.code === 'ETIMEDOUT') {
          errorMessage = `Gemini CLI timed out after ${timeout/1000} seconds`;
        } else if ('signal' in error && error.signal === 'SIGTERM') {
          errorMessage = 'Gemini CLI was terminated';
        } else if ('stdout' in error && 'stderr' in error) {
          // execFile error with output
          const execError = error as any;
          errorMessage = `Gemini CLI error (exit code ${execError.code}): ${execError.stderr || execError.message}`;
        } else {
          errorMessage = error.message;
        }
      }

      return {
        ok: false,
        error: errorMessage
      };
    }
  }

  /**
   * Build gemini CLI arguments for file/directory analysis
   */
  buildAnalyzeArgs(paths: string[], prompt: string, additionalFlags: string[] = []): string[] {
    const args = ['-p'];
    
    // Add path references with @ syntax
    const pathRefs = paths.map(path => `@${path}`).join(' ');
    const fullPrompt = `${pathRefs} ${prompt}`;
    
    args.push(fullPrompt);
    
    // Add any additional flags
    if (additionalFlags.length > 0) {
      args.push(...additionalFlags);
    }
    
    return args;
  }

  /**
   * Build gemini CLI arguments for directory analysis
   */
  buildAnalyzeDirArgs(dir: string, prompt: string, recursive = true, additionalFlags: string[] = []): string[] {
    const args = ['-p'];
    
    // Use @dir/ syntax for directory inclusion
    const dirRef = recursive ? `@${dir}/` : `@${dir}`;
    const fullPrompt = `${dirRef} ${prompt}`;
    
    args.push(fullPrompt);
    
    if (additionalFlags.length > 0) {
      args.push(...additionalFlags);
    }
    
    return args;
  }

  /**
   * Build gemini CLI arguments for raw prompt
   */
  buildRawPromptArgs(prompt: string, additionalFlags: string[] = []): string[] {
    const args = ['-p', prompt];
    
    if (additionalFlags.length > 0) {
      args.push(...additionalFlags);
    }
    
    return args;
  }
} 