import { ConfigStore } from './types.js';

export class ConfigManager {
  private config: ConfigStore = {};

  constructor() {
    this.loadDefaults();
  }

  private loadDefaults(): void {
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
  get(key: string): unknown {
    return this.config[key as keyof ConfigStore];
  }

  /**
   * Set a configuration value
   */
  set(key: string, value: unknown): void {
    // Simple validation - in a real implementation, you'd want more robust validation
    if (key in this.config) {
      (this.config as any)[key] = value;
    } else {
      throw new Error(`Unknown configuration key: ${key}`);
    }
  }

  /**
   * Get all configuration
   */
  getAll(): ConfigStore {
    return { ...this.config };
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.loadDefaults();
  }

  /**
   * Get environment variables for process spawning
   * Merges configured environment variables with process.env
   */
  getEnvironmentVariables(): Record<string, string> {
    const configuredEnvVars = this.config.environmentVariables || {};
    const processEnv: Record<string, string> = {};

    // Copy process.env, filtering out undefined values
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        processEnv[key] = value;
      }
    }

    // Merge configured environment variables, only if they have non-empty values
    const filteredConfiguredEnvVars: Record<string, string> = {};
    for (const [key, value] of Object.entries(configuredEnvVars)) {
      if (value && value.trim() !== '') {
        filteredConfiguredEnvVars[key] = value;
      }
    }

    return { ...processEnv, ...filteredConfiguredEnvVars };
  }
}

// Global config instance
export const config = new ConfigManager(); 