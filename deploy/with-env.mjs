// Load a specific environment without shell evaluation or printing secrets.
// Usage: node with-env.mjs config.env -- executable arg ...
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';

const [file, separator, command, ...args] = process.argv.slice(2);
if (!file || separator !== '--' || !command) {
  console.error('Usage: node with-env.mjs config.env -- executable arg ...');
  process.exit(2);
}
const env = { ...process.env, ...parseEnv(readFileSync(file, 'utf8')) };
const child = spawn(command, args, { env, stdio: 'inherit', windowsHide: true });
child.once('error', () => { console.error('Could not start the requested command.'); process.exitCode = 1; });
child.once('exit', code => { process.exitCode = code ?? 1; });
