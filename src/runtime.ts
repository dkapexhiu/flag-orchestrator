import type { FlagsManifest } from './analyzer.js';

export interface Provider {
  get(key: string, context?: any): Promise<any> | any;
}

export interface FlagClientOptions {
  manifest: FlagsManifest;
  providers: Provider[];
}

export function createFlagClient({ manifest, providers }: FlagClientOptions) {
  return {
    async get<T>(key: keyof FlagsManifest, context?: any): Promise<T> {
      for (const provider of providers) {
        try {
          const value = await provider.get(key as string, context);
          if (value !== undefined) return value as T;
        } catch {}
      }
      return manifest[key as string].default as T;
    }
  };
}

// Example providers
export function envProvider() {
  return {
    get(key: string) {
      return process.env[`FLAG_${key.toUpperCase()}`];
    }
  };
}
