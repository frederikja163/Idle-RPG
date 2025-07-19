import { sql } from 'drizzle-orm';
import { customType } from 'drizzle-orm/sqlite-core';

export const timestamp = customType<{
  data: Date;
  driverData: number;
}>({
  toDriver(value: Date): number {
    return Math.floor(value.getTime() / 1000);
  },
  fromDriver(value: number): Date {
    return new Date(value * 1000);
  },
  dataType(): string {
    return 'integer';
  },
});

export const timestampNow = sql`(strftime('%s', 'now'))`;
