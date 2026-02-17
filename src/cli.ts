#!/usr/bin/env node

import { Command } from 'commander';
import { scanFlags, generateTypes } from './analyzer.js';

const program = new Command()
  .name('flag-orchestrator')
  .description('Feature flag orchestrator CLI')
  .version('0.1.0');

program
  .command('scan')
  .description('Scan codebase for flags')
  .argument('[dirs...]', 'Source directories', ['src'])
  .action((dirs) => {
    const manifest = scanFlags(dirs);
    console.log(JSON.stringify(manifest, null, 2));
  });

program
  .command('generate')
  .description('Generate types from manifest')
  .action(() => {
    // Load manifest, generate
    generateTypes({}, './flags.generated.ts');
  });

program.parse();

export { program as cli };
