import { $ } from 'bun';

console.log('Running back-end in dev mode with bun be...');
const backend = $`bun be`;

console.log('Running front-end in dev mode with bun fe...');
const frontend = $`bun fe`;

await Promise.all([frontend, backend]);
