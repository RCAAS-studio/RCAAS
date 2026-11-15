/** Read-only structural audit. Candidates require review; this never deletes code. */
import ts from 'typescript';
import { readdirSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const slash = value => value.replaceAll('\\', '/');
const relative = value => slash(path.relative(root, value));
function filesIn(folder) {
  if (!existsSync(folder)) return [];
  return readdirSync(folder, { withFileTypes: true }).flatMap(item => {
    if (['node_modules', 'vendor', 'data', 'fixtures'].includes(item.name) || item.name.startsWith('.')) return [];
    const file = path.join(folder, item.name);
    return item.isDirectory() ? filesIn(file) : /\.[cm]?[jt]sx?$/.test(item.name) ? [file] : [];
  });
}
const files = ['src', 'server/src', 'server/scripts', 'server/test', 'scripts', 'test'].flatMap(name => filesIn(path.join(root, name)));
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile).config;
const options = { ...ts.convertCompilerOptionsFromJson(config.compilerOptions, root).options, allowJs: true };
const cache = ts.createModuleResolutionCache(root, value => value.toLowerCase(), options);
const modules = new Map(), broken = [], caseMismatches = [], serverImports = [], duplicates = new Map();
const printer = ts.createPrinter({ removeComments: true });
function resolve(specifier, file) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null;
  let result = ts.resolveModuleName(specifier, file, options, ts.sys, cache).resolvedModule?.resolvedFileName;
  if (!result) {
    const candidate = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : path.resolve(path.dirname(file), specifier);
    if (existsSync(candidate) && statSync(candidate).isFile()) result = candidate;
  }
  return result ? path.resolve(result) : undefined;
}
function exactCase(file) {
  const rel = path.relative(root, file);
  if (rel.startsWith('..')) return true;
  let current = root;
  for (const part of rel.split(path.sep)) {
    if (!readdirSync(current).includes(part)) return false;
    current = path.join(current, part);
  }
  return true;
}
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const client = ast.statements.some(node => ts.isExpressionStatement(node) && node.expression.text === 'use client');
  const record = { file: relative(file), client, edges: [], exports: [], typeExports: [], identifiers: new Map(), imports: [] };
  modules.set(path.resolve(file), record);
  function edge(specifier, typeOnly, names, kind) {
    const target = resolve(specifier, file);
    if (target === undefined) broken.push({ file: record.file, specifier, kind });
    if (!target) return;
    record.edges.push({ target, typeOnly, names, kind });
    record.imports.push(specifier);
    if (!exactCase(target)) caseMismatches.push({ file: record.file, specifier, target: relative(target) });
    if (record.file.startsWith('src/') && relative(target).startsWith('server/')) serverImports.push({ file: record.file, target: relative(target) });
  }
  function visit(node) {
    if (ts.isIdentifier(node)) record.identifiers.set(node.text, (record.identifiers.get(node.text) ?? 0) + 1);
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause, bindings = clause?.namedBindings;
      const typeOnly = !!clause?.isTypeOnly || !!(bindings && ts.isNamedImports(bindings) && !clause.name && bindings.elements.length && bindings.elements.every(item => item.isTypeOnly));
      const names = clause ? [...(clause.name ? ['default'] : []), ...(bindings ? ts.isNamedImports(bindings) ? bindings.elements.map(item => (item.propertyName ?? item.name).text) : ['*'] : [])] : [];
      edge(node.moduleSpecifier.text, typeOnly, names, 'import');
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier) edge(node.moduleSpecifier.text, node.isTypeOnly, node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements.map(item => (item.propertyName ?? item.name).text) : ['*'], 're-export');
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(ast) === 'require') && ts.isStringLiteral(node.arguments[0])) edge(node.arguments[0].text, false, ['*'], 'dynamic');
    if (ts.isNewExpression(node) && node.expression.getText(ast) === 'URL' && ts.isStringLiteral(node.arguments?.[0]) && node.arguments[0].text.startsWith('.')) edge(node.arguments[0].text, false, ['*'], 'asset/worker URL');
    if ((ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && node.body) {
      const body = printer.printNode(ts.EmitHint.Unspecified, node.body, ast);
      if (body.length > 180) {
        const hash = createHash('sha256').update(body).digest('hex');
        const list = duplicates.get(hash) ?? [];
        list.push({ file: record.file, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, name: node.name?.text ?? node.parent?.name?.getText(ast) ?? '(callback)' });
        duplicates.set(hash, list);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const node of ast.statements) {
    if (!node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if (node.modifiers.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) record.exports.push('default');
    else if (node.name) {
      record.exports.push(node.name.text);
      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) record.typeExports.push(node.name.text);
    }
    else if (ts.isVariableStatement(node)) for (const declaration of node.declarationList.declarations) if (ts.isIdentifier(declaration.name)) record.exports.push(declaration.name.text);
  }
}
const roots = [...modules].filter(([, record]) => record.file.endsWith('.d.ts') || record.file.startsWith('src/app/') || record.file === 'src/proxy.ts' || record.file === 'server/src/index.js' || /^(?:test|scripts|server\/test|server\/scripts)\//.test(record.file)).map(([file]) => file);
const reachable = new Set();
function reach(file) { if (reachable.has(file)) return; reachable.add(file); for (const edge of modules.get(file)?.edges ?? []) reach(edge.target); }
roots.forEach(reach);
// Tarjan SCCs report runtime and type-only cycles separately.
function cycles(runtimeOnly) {
  const index = new Map(), low = new Map(), stack = [], active = new Set(), result = [];
  let counter = 0;
  function visit(file) {
    index.set(file, counter); low.set(file, counter++); stack.push(file); active.add(file);
    for (const edge of modules.get(file).edges) {
      if ((runtimeOnly && edge.typeOnly) || !modules.has(edge.target)) continue;
      if (!index.has(edge.target)) { visit(edge.target); low.set(file, Math.min(low.get(file), low.get(edge.target))); }
      else if (active.has(edge.target)) low.set(file, Math.min(low.get(file), index.get(edge.target)));
    }
    if (low.get(file) === index.get(file)) {
      const group = []; let item;
      do { item = stack.pop(); active.delete(item); group.push(relative(item)); } while (item !== file);
      if (group.length > 1) result.push(group.sort());
    }
  }
  for (const file of modules.keys()) if (!index.has(file)) visit(file);
  return result;
}
const imported = new Map();
for (const record of modules.values()) for (const edge of record.edges) {
  const names = imported.get(edge.target) ?? new Set(); edge.names.forEach(name => names.add(name)); imported.set(edge.target, names);
}
const report = {
  scope: 'Application/server/scripts/tests; excludes generated files, vendor SDK, data and fixtures. Import/export candidates are conservative static evidence, not automatic deletion instructions.',
  modules: modules.size, edges: [...modules.values()].reduce((count, record) => count + record.edges.length, 0),
  broken, caseMismatches, frontendServerImports: serverImports,
  runtimeCycles: cycles(true), allCycles: cycles(false),
  unreachableCandidates: [...modules].filter(([file, record]) => !reachable.has(file) && /^(src|server\/src)\//.test(record.file)).map(([, record]) => record.file),
  unconsumedExportCandidates: [...modules].flatMap(([file, record]) => record.file.startsWith('src/app/') || !reachable.has(file) || imported.get(file)?.has('*') ? [] : record.exports.filter(name => !imported.get(file)?.has(name)).map(name => ({ file: record.file, name, disposition: record.typeExports.includes(name) ? 'type contract' : record.file === 'src/proxy.ts' ? 'Next framework entry' : (record.identifiers.get(name) ?? 0) > 1 ? 'used within declaring module' : 'manual review candidate' }))),
  identicalFunctionCandidates: [...duplicates.values()].filter(group => new Set(group.map(item => item.file)).size > 1),
  clientEntries: [...modules.values()].filter(record => record.client).map(record => record.file),
};
const output = process.argv[2];
if (output) writeFileSync(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ modules: report.modules, edges: report.edges, broken: broken.length, caseMismatches: caseMismatches.length, frontendServerImports: serverImports.length, runtimeCycles: report.runtimeCycles.length, unreachableCandidates: report.unreachableCandidates, duplicateGroups: report.identicalFunctionCandidates.length, unconsumedExportCandidates: report.unconsumedExportCandidates.length }, null, 2));
if (broken.length || caseMismatches.length || serverImports.length || report.runtimeCycles.length) process.exitCode = 1;
