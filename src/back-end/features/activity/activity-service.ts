import type { ActivityDef } from '@/shared/definition/definition-activities';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';

export interface ActivityService<T extends ActivityDef> {
  startActivity(profileId: ProfileId, activity: T): Promise<void>;
  stopActivity(profileId: ProfileId, activity: T): Promise<void>;
}
