// Marketing content uses bundler-style extensionless TS imports. Transpile it
// in Node tests with the project's existing compiler, without importing UI pages.
import { registerHooks } from 'node:module';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:') && !context.parentURL.includes('/node_modules/')) {
      const url = new URL(specifier, context.parentURL);
      for (const suffix of ['', '.ts', '/index.ts']) {
        const candidate = url.href + suffix;
        if (existsSync(fileURLToPath(candidate)) && statSync(fileURLToPath(candidate)).isFile()) return next(candidate, context);
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith('file:') && url.endsWith('.ts') && !url.includes('/node_modules/')) {
      const source = readFileSync(fileURLToPath(url), 'utf8');
      return {
        format: 'module', shortCircuit: true,
        source: ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText,
      };
    }
    return next(url, context);
  },
});
