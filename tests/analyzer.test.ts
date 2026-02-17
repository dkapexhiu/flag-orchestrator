import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Project } from 'ts-morph';
import path from 'path';
import { scanFlags } from '../src/analyzer.js';
import fs from 'fs';

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn()
}));

describe('analyzer', () => {
  let project: Project;
  const mockSourceDir = path.resolve(__dirname, '../mock-src');

  beforeEach(() => {
    project = new Project({
      tsConfigFilePath: './tsconfig.json'
    });
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    project.getSourceFiles().forEach((sourceFile) => sourceFile.forget());
  });

  it('detects useFlag calls with string literals', () => {
    // Create mock source file with flag usage
    const sourceFile = project.createSourceFile(
      path.join(mockSourceDir, 'routes.ts'),
      `
      import { useFlag } from './flags';
      const enabled = useFlag("newCheckoutFlow");
      const variant = useFlag("pricingExperiment", "A");
      console.log("no-flag");
    `
    );

    const manifest = scanFlags([mockSourceDir], project);
    
    expect(manifest).toEqual({
      newCheckoutFlow: {
        type: 'boolean',
        locations: [sourceFile.getFilePath() + ':3']
      },
      pricingExperiment: {
        type: 'boolean',
        locations: [sourceFile.getFilePath() + ':4']
      }
    });
  });

  it('detects flag() calls across multiple files', () => {
    project.createSourceFile(
      path.join(mockSourceDir, 'service.ts'),
      `flag("userSegment");`
    );
    project.createSourceFile(
      path.join(mockSourceDir, 'cron.ts'),
      `flag("batchProcess");`
    );

    const manifest = scanFlags([mockSourceDir], project);
    
    expect(Object.keys(manifest)).toEqual(expect.arrayContaining([
      'userSegment', 'batchProcess'
    ]));
    expect(manifest.userSegment.locations).toHaveLength(1);
  });

  it('handles no flag usages gracefully', () => {
    project.createSourceFile(
      path.join(mockSourceDir, 'empty.ts'),
      `console.log("plain code");`
    );

    const manifest = scanFlags([mockSourceDir], project);
    
    expect(manifest).toEqual({});
  });

  it('aggregates locations for duplicate flag names', () => {
    project.createSourceFile(
      path.join(mockSourceDir, 'app1.ts'),
      `useFlag("sharedFlag");`
    );
    project.createSourceFile(
      path.join(mockSourceDir, 'app2.ts'),
      `useFlag("sharedFlag");`
    );

    const manifest = scanFlags([mockSourceDir], project);
    
    expect(manifest.sharedFlag.locations).toHaveLength(2);
  });

  it('ignores non-string literal arguments', () => {
    project.createSourceFile(
      path.join(mockSourceDir, 'dynamic.ts'),
      `
      const flagName = "dynamic";
      useFlag(flagName);  // Ignored - not literal
      useFlag("literalFlag");  // Detected
    `
    );

    const manifest = scanFlags([mockSourceDir], project);
    
    expect(Object.keys(manifest)).toEqual(['literalFlag']);
  });
});
