import { describe, it, expect } from 'vitest';
import { createFlagClient, envProvider } from '../src/runtime.js';

describe('FlagClient', () => {
  it('resolves from env', async () => {
    process.env.FLAG_TEST = 'true';
    const client = createFlagClient({
      manifest: { test: { type: 'boolean', default: false, locations: [] } },
      providers: [envProvider()]
    });
    expect(await client.get('test')).toBe('true');
  });
});
