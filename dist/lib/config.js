"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.ConfigManager = void 0;
class ConfigManager {
    constructor() {
        this.config = {};
        this.loadDefaults();
    }
    loadDefaults() {
        this.config = {
            geminiPath: 'gemini',
            defaultFlags: [],
            defaultTimeout: 300,
            defaultMaxOutputKB: 1024,
        };
    }
    /**
     * Get a configuration value
     */
    get(key) {
        return this.config[key];
    }
    /**
     * Set a configuration value
     */
    set(key, value) {
        // Simple validation - in a real implementation, you'd want more robust validation
        if (key in this.config) {
            this.config[key] = value;
        }
        else {
            throw new Error(`Unknown configuration key: ${key}`);
        }
    }
    /**
     * Get all configuration
     */
    getAll() {
        return { ...this.config };
    }
    /**
     * Reset to defaults
     */
    reset() {
        this.loadDefaults();
    }
}
exports.ConfigManager = ConfigManager;
// Global config instance
exports.config = new ConfigManager();
//# sourceMappingURL=config.js.map