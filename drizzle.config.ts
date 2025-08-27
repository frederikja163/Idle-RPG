import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: 'backend/src/core/db/migration',
  schema: 'shared/src/definition/schema/db',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
  strict: true,
  verbose: true,
});
