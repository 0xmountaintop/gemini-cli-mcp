"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiCLI = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
class GeminiCLI {
    constructor(geminiPath = 'gemini', defaultTimeout = 60, defaultMaxOutputKB = 1024) {
        this.geminiPath = geminiPath;
        this.defaultTimeout = defaultTimeout;
        this.defaultMaxOutputKB = defaultMaxOutputKB;
    }
    /**
     * Resolve and validate file/directory paths
     */
    async resolvePaths(paths, cwd = process.cwd()) {
        const resolved = {
            absolute: [],
            relative: []
        };
        for (const path of paths) {
            try {
                // Convert to absolute path
                const absolutePath = (0, path_1.isAbsolute)(path) ? path : (0, path_1.resolve)(cwd, path);
                // Check if path exists
                await (0, promises_1.access)(absolutePath, fs_1.constants.F_OK);
                // Get stats to verify it's a file or directory
                const stats = await (0, promises_1.stat)(absolutePath);
                if (!stats.isFile() && !stats.isDirectory()) {
                    throw new Error(`Path is neither file nor directory: ${path}`);
                }
                resolved.absolute.push(absolutePath);
                // For gemini CLI, we need relative paths from cwd
                // Since we're running gemini from cwd, we can use the original path if it's relative
                // or calculate relative path if it's absolute
                const relativePath = (0, path_1.isAbsolute)(path) ?
                    this.getRelativePath(cwd, absolutePath) :
                    path;
                resolved.relative.push(relativePath);
            }
            catch (error) {
                throw new Error(`Invalid path '${path}': ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        return resolved;
    }
    /**
     * Get relative path from cwd to target
     */
    getRelativePath(cwd, target) {
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
    async checkGeminiAvailable() {
        try {
            await execFileAsync(this.geminiPath, ['--version'], { timeout: 5000 });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Execute gemini CLI with given arguments
     */
    async spawnGemini(args, options = {}) {
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
            const { stdout, stderr } = await execFileAsync(this.geminiPath, args, {
                timeout,
                cwd,
                maxBuffer: maxOutputKB * 1024, // Convert KB to bytes
                encoding: 'utf8'
            });
            // If there's stderr content, include it in the response
            const output = stdout + (stderr ? `\n[stderr]: ${stderr}` : '');
            return {
                ok: true,
                output: output.trim(),
                // Note: We don't have direct access to token usage from gemini CLI
                // This would need to be parsed from output if available
            };
        }
        catch (error) {
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                if ('code' in error && error.code === 'ETIMEDOUT') {
                    errorMessage = `Gemini CLI timed out after ${timeout / 1000} seconds`;
                }
                else if ('signal' in error && error.signal === 'SIGTERM') {
                    errorMessage = 'Gemini CLI was terminated';
                }
                else if ('stdout' in error && 'stderr' in error) {
                    // execFile error with output
                    const execError = error;
                    errorMessage = `Gemini CLI error (exit code ${execError.code}): ${execError.stderr || execError.message}`;
                }
                else {
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
    buildAnalyzeArgs(paths, prompt, additionalFlags = []) {
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
    buildAnalyzeDirArgs(dir, prompt, recursive = true, additionalFlags = []) {
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
    buildRawPromptArgs(prompt, additionalFlags = []) {
        const args = ['-p', prompt];
        if (additionalFlags.length > 0) {
            args.push(...additionalFlags);
        }
        return args;
    }
}
exports.GeminiCLI = GeminiCLI;
//# sourceMappingURL=gemini-cli.js.map