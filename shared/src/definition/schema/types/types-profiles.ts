import type { Activity } from '@/shared/socket/socket-types';
import type { profilesTable } from '../db/db-profiles';

export type Profile = Omit<typeof profilesTable.$inferSelect, 'activity'> & { activity: Activity };
export type ProfileId = string;
export type ProfileInsert = Pick<Profile, 'name' | 'activity'>;
