import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import { resolve, dirname, isAbsolute } from 'path';
import { stat, access } from 'fs/promises';
import { constants } from 'fs';
import { GeminiResponse, GeminiResult, GeminiError, SpawnGeminiOptions, ResolvedPaths } from './types.js';
import { config } from './config.js';

const execFileAsync = promisify(execFile);

export class GeminiCLI {
  constructor() {
    // Configuration is now read dynamically from the global config instance
  }

  /**
   * Get the current gemini path from configuration
   */
  private get geminiPath(): string {
    return config.get('geminiPath') as string;
  }

  /**
   * Get the current default timeout from configuration
   */
  private get defaultTimeout(): number {
    return config.get('defaultTimeout') as number;
  }

  /**
   * Get the current default max output KB from configuration
   */
  private get defaultMaxOutputKB(): number {
    return config.get('defaultMaxOutputKB') as number;
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

      // Use spawn instead of execFile to properly handle stdin
      return await this.spawnGeminiWithStdin(args, { timeout, cwd, maxOutputKB });

    } catch (error) {
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        ok: false,
        error: errorMessage
      };
    }
  }

  /**
   * Execute gemini CLI using spawn with proper stdin handling
   */
  private async spawnGeminiWithStdin(args: string[], options: { timeout: number, cwd: string, maxOutputKB: number }): Promise<GeminiResponse> {
    return new Promise((resolve) => {
      const child = spawn(this.geminiPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: options.cwd
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout;

      // Set up timeout
      timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({
          ok: false,
          error: `Gemini CLI timed out after ${options.timeout/1000} seconds`
        });
      }, options.timeout);

      // Collect stdout
      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
        
        // Check if we've exceeded max output size
        if (stdout.length > options.maxOutputKB * 1024) {
          child.kill('SIGTERM');
          clearTimeout(timeoutId);
          resolve({
            ok: false,
            error: `Output exceeded maximum size of ${options.maxOutputKB}KB`
          });
        }
      });

      // Collect stderr
      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      // Handle process completion
      child.on('close', (code: number | null, signal: NodeJS.Signals | null) => {
        clearTimeout(timeoutId);
        
        if (signal === 'SIGTERM') {
          // Don't resolve here if we already resolved due to timeout
          return;
        }

        if (code === 0) {
          // Success
          const output = stdout + (stderr ? `\n[stderr]: ${stderr}` : '');
          resolve({
            ok: true,
            output: output.trim()
          });
        } else {
          // Error
          resolve({
            ok: false,
            error: `Gemini CLI exited with code ${code}: ${stderr || 'Unknown error'}`
          });
        }
      });

      // Handle process errors
      child.on('error', (error: Error) => {
        clearTimeout(timeoutId);
        resolve({
          ok: false,
          error: `Failed to start Gemini CLI: ${error.message}`
        });
      });

      // Important: Close stdin immediately since we're not providing input
      // This prevents gemini from waiting for stdin input
      child.stdin.end();
    });
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