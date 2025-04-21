import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "src/back-end/db/migration",
  schema: "src/back-end/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
  strict: true,
  verbose: true,
});
