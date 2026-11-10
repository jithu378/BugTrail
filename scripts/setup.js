/**
 * One-command project setup:
 * - creates backend/.env with a generated JWT secret (if missing)
 * - installs backend and frontend dependencies
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';

function run(args, cwd) {
  const result = spawnSync(npm, args, { cwd, stdio: 'inherit', shell: isWindows });
  if (result.status !== 0) {
    console.error(`\nCommand failed: npm ${args.join(' ')} (${cwd})`);
    process.exit(result.status ?? 1);
  }
}

const envPath = path.join(root, 'backend', '.env');
if (!existsSync(envPath)) {
  const example = readFileSync(path.join(root, 'backend', '.env.example'), 'utf8');
  const secret = randomBytes(48).toString('hex');
  writeFileSync(
    envPath,
    example.replace('JWT_SECRET=replace-this-with-a-long-random-secret', `JWT_SECRET=${secret}`),
  );
  console.log('Created backend/.env with a generated JWT secret.');
}

console.log('\nInstalling backend dependencies...');
run(['install'], path.join(root, 'backend'));

console.log('\nInstalling frontend dependencies...');
run(['install'], path.join(root, 'frontend'));

console.log('\nSetup complete. Run "npm run dev" and open http://localhost:5173');
