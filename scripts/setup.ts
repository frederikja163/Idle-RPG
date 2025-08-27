import { existsSync, readFileSync, writeFileSync } from 'fs';
import { $ } from 'bun';

const envPaths = [
  {
    target: '.env',
    example: '.env.example',
  },
  {
    target: 'frontend/src/.env',
    example: 'frontend/src/.env.example',
  },
];

for (const { target, example } of envPaths) {
  copyEnvIfNotExists(target, example);
}

function copyEnvIfNotExists(targetPath: string, examplePath: string) {
  if (existsSync(targetPath)) {
    console.log(`${targetPath} already exists, skipping copy.`);
  } else {
    if (!existsSync(examplePath)) {
      console.error(`${examplePath} not found!`);
      process.exit(1);
    }
    const content = readFileSync(examplePath, 'utf-8');
    writeFileSync(targetPath, content);
    console.log(`${targetPath} created from .env.example`);
  }
}

console.log('Installing dependencies with bun install...');
await $`bun install`;

console.log('Migrating database with bun db:push...');
await $`bun db:push`;
