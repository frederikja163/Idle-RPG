import { $ } from 'bun';

console.log('Running backend in dev mode with bun be...');
const backend = $`bun be`;

console.log('Running frontend in dev mode with bun fe...');
const frontend = $`bun fe`;

await Promise.all([frontend, backend]);
