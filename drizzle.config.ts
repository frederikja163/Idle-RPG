import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: 'src/back-end/core/db/migration',
  schema: 'src/shared/definition/schema/db',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
  strict: true,
  verbose: true,
});
