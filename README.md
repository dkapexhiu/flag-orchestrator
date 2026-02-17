# @dkapexhiu/flag-orchestrator

Runtime feature flag orchestrator with code scanning and typed manifests for Node.js apps.

## Install

```bash
npm i @dkapexhiu/flag-orchestrator
```

## CLI Commands

### scan - Scan codebase for feature flags

Scans your TypeScript codebase for feature flag usages and outputs a manifest.

```bash
# Scan default 'src' directory
npx flag-orchestrator scan

# Scan multiple directories
npx flag-orchestrator scan src lib utils

# Scan specific directory
npx flag-orchestrator scan ./src/features
```

**Output:** JSON manifest with all detected flags, their types, and locations:

```json
{
  "newCheckoutFlow": {
    "type": "boolean",
    "locations": [
      "src/routes.ts:3"
    ]
  },
  "pricingExperiment": {
    "type": "boolean",
    "locations": [
      "src/routes.ts:4"
    ]
  }
}
```

**Detected Patterns:**
- `useFlag("flagName")`
- `flag("flagName")`

### generate - Generate TypeScript types from manifest

Generates TypeScript type definitions from a flag manifest.

```bash
npx flag-orchestrator generate
```

**Output:** Creates `flags.generated.ts` with typed flag definitions.

## Usage

### Runtime Flag Client

```ts
import { createFlagClient, type FlagsManifest, type Provider } from '@dkapexhiu/flag-orchestrator';

// Define your flag manifest
const manifest: FlagsManifest = {
  newFeature: {
    type: 'boolean',
    default: false,
    locations: ['src/home.ts:10']
  },
  premiumTier: {
    type: 'string',
    default: 'basic',
    locations: ['src/pricing.ts:15']
  }
};

// Create a flag client with providers
const flagClient = createFlagClient({
  manifest,
  providers: [
    envProvider(),  // Check environment variables
    // Add more providers as needed
  ]
});

// Use flags in your code
const isPremium = await flagClient.get('premiumTier');
```

#### Built-in Providers

**envProvider()** - Reads flags from environment variables with `FLAG_` prefix

```ts
import { envProvider } from '@dkapexhiu/flag-orchestrator';

// Environment: FLAG_MY_FLAG=true
const provider = envProvider();
const value = await provider.get('MY_FLAG');  // true
```

### Scanning Code

```ts
import { scanFlags } from '@dkapexhiu/flag-orchestrator';

// Scan source directories
const manifest = scanFlags(['src', 'lib']);
console.log(manifest);
```

### Generating Types

```ts
import { generateTypes, type FlagsManifest } from '@dkapexhiu/flag-orchestrator';

const manifest: FlagsManifest = {
  // ... your flags
};

generateTypes(manifest, './flags.generated.ts');
```

## API Documentation

For complete API documentation, see [docs](https://dkapexhiu.github.io/flag-orchestrator/) or generate it with:

```bash
npm run docs
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build production distribution files |
| `npm run dev` | Watch mode build (for development) |
| `npm test` | Run test suite |
| `npm run lint` | Run ESLint checks |
| `npm run docs` | Generate TypeDoc API documentation |

## License

MIT

