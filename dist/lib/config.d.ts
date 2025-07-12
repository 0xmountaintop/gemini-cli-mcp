import { ConfigStore } from './types.js';
export declare class ConfigManager {
    private config;
    constructor();
    private loadDefaults;
    /**
     * Get a configuration value
     */
    get(key: string): unknown;
    /**
     * Set a configuration value
     */
    set(key: string, value: unknown): void;
    /**
     * Get all configuration
     */
    getAll(): ConfigStore;
    /**
     * Reset to defaults
     */
    reset(): void;
}
export declare const config: ConfigManager;
//# sourceMappingURL=config.d.ts.map