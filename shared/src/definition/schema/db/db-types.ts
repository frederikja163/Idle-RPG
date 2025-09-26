import { sql } from 'drizzle-orm';

export const timestampNowSql = sql`(CAST(ROUND((julianday('now') - 2440587.5)*86400000) As INTEGER))`;
