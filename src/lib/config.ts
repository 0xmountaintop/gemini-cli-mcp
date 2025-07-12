import { ConfigStore } from './types.js';

export class ConfigManager {
  private config: ConfigStore = {};

  constructor() {
    this.loadDefaults();
  }

  private loadDefaults(): void {
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
}

// Global config instance
export const config = new ConfigManager(); 