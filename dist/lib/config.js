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
            geminiPath: process.env.GEMINI_CLI_PATH || 'gemini',
            defaultFlags: [],
            defaultTimeout: 300,
            defaultMaxOutputKB: 1024,
            environmentVariables: {
                GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
                GOOGLE_GENAI_USE_VERTEXAI: process.env.GOOGLE_GENAI_USE_VERTEXAI || 'false'
            },
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
    /**
     * Get environment variables for process spawning
     * Merges configured environment variables with process.env
     */
    getEnvironmentVariables() {
        const configuredEnvVars = this.config.environmentVariables || {};
        const processEnv = {};
        // Copy process.env, filtering out undefined values
        for (const [key, value] of Object.entries(process.env)) {
            if (value !== undefined) {
                processEnv[key] = value;
            }
        }
        // Merge configured environment variables, only if they have non-empty values
        const filteredConfiguredEnvVars = {};
        for (const [key, value] of Object.entries(configuredEnvVars)) {
            if (value && value.trim() !== '') {
                filteredConfiguredEnvVars[key] = value;
            }
        }
        return { ...processEnv, ...filteredConfiguredEnvVars };
    }
}
exports.ConfigManager = ConfigManager;
// Global config instance
exports.config = new ConfigManager();
//# sourceMappingURL=config.js.map