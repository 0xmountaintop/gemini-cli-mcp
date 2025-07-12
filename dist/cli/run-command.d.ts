interface RunOptions {
    prompt?: string;
    paths?: string[];
    dir?: string;
    recursive?: boolean;
    timeout?: string;
    maxOutput?: string;
}
export declare class RunCommand {
    /**
     * Execute a one-shot command
     */
    execute(options: RunOptions): Promise<void>;
}
export {};
//# sourceMappingURL=run-command.d.ts.map