/**
 * Starts the backend API and the Vite dev server together.
 * Zero dependencies - uses the Node child_process API.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';

if (!existsSync(path.join(root, 'backend', '.env'))) {
  console.error('Missing backend/.env. Run "npm run setup" first.');
  process.exit(1);
}

const children = [];
let shuttingDown = false;

function start(name, cwd, args, color) {
  const child = spawn(npm, args, { cwd, stdio: 'inherit', shell: isWindows });
  children.push(child);

  child.on('exit', (code) => {
    if (shuttingDown) return;
    console.log(`\n[${name}] exited with code ${code ?? 0}. Stopping the other process...`);
    shutdown(code ?? 1);
  });

  child.on('error', (error) => {
    console.error(`[${name}] failed to start:`, error.message);
    shutdown(1);
  });

  console.log(`${color}[${name}] starting...${'\u001b[0m'}`);
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null) {
      if (isWindows) {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
    }
  }
  setTimeout(() => process.exit(code), 400);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

start('backend', path.join(root, 'backend'), ['run', 'dev'], '\u001b[36m');
start('frontend', path.join(root, 'frontend'), ['run', 'dev'], '\u001b[33m');

console.log('\nBugTrail is starting: API http://localhost:5000 | App http://localhost:5173\n');
