import {existsSync, readFileSync, writeFileSync} from "fs";
import {$} from "bun";

const envPath = ".env";
const frontEndEnvPath = "src/front-end/.env";
const examplePath = ".env.example";

function copyEnvIfNotExists(targetPath: string) {
  if (existsSync(targetPath)) {
    console.log(`${targetPath} already exists, skipping copy.`);
  } else {
    if (!existsSync(examplePath)) {
      console.error(`${examplePath} not found!`);
      process.exit(1);
    }
    const content = readFileSync(examplePath, "utf-8");
    writeFileSync(targetPath, content);
    console.log(`${targetPath} created from .env.example`);
  }
}

copyEnvIfNotExists(envPath);
copyEnvIfNotExists(frontEndEnvPath);

console.log("Running bun install...");
await $`bun install`;
