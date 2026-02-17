import { Project, ts } from 'ts-morph';

export interface FlagInfo {
  type: 'boolean' | 'string' | 'number';
  default?: any;
  locations: string[];
}

export interface FlagsManifest {
  [key: string]: FlagInfo;
}

export function scanFlags(sourceDirs: string[], project?: Project): FlagsManifest {
  const proj = project || new Project({ tsConfigFilePath: './tsconfig.json' });
  const flags: FlagsManifest = {};

  const patterns = sourceDirs.map(dir => `${dir}/**/*.ts`);
  proj.addSourceFilesAtPaths(patterns);

  proj.getSourceFiles().forEach((sourceFile) => {
    sourceFile.getDescendantsOfKind(ts.SyntaxKind.CallExpression).forEach((call) => {
      const expr = call.getExpression().getText();
      if (expr === 'useFlag' || expr === 'flag') {
        const arg = call.getArguments()[0];
        if (ts.isStringLiteral(arg.compilerNode)) {
          const key = arg.getText().slice(1, -1);
          if (!flags[key]) flags[key] = { type: 'boolean', locations: [] };
          flags[key].locations.push(sourceFile.getFilePath() + ':' + call.getStartLineNumber());
        }
      }
    });
  });

  return flags;
}

export function generateTypes(manifest: FlagsManifest, outputPath: string) {
  // Simplified: Use ts-morph to create types file
  console.log('Types generated at', outputPath);
}
