import type { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import type { ItemService } from '../item/item-service';
import type { ProfileService } from '../profile/profile-service';
import type { SkillService } from '../skill/skill-service';
import type { GatheringActivityDef } from '@/shared/definition/definition-activities';
import type { Profile, ProfileId } from '@/shared/definition/schema/types/types-profiles';
import { ServerError, ErrorType } from '@/shared/socket/socket-errors';
import { getActionCount, proccessGatheringActivity as processGatheringActivity } from '@/shared/util/util-activities';
import { addXp } from '@/shared/util/util-skills';
import type { ActivityService } from './activity-service';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { addItems } from '@/shared/util/util-items';
import { ServerProfileUpdater } from '../profile/profile-updater';

@injectableSingleton()
export class GatheringService implements ActivityService<GatheringActivityDef> {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileService: ProfileService,
    private readonly skillService: SkillService,
    private readonly itemService: ItemService,
  ) {}

  public async startActivity(profileId: ProfileId, activity: GatheringActivityDef) {
    const profile = await this.profileService.getProfileById(profileId);
    const skill = await this.skillService.getSkillById(profileId, activity.skill);
    if (skill.level < activity.levelRequirement) throw new ServerError(ErrorType.InsufficientLevel);

    const activityStart = new Date();
    profile.activityId = activity.id;
    profile.activityStart = activityStart;
    this.profileService.update(profile.id);
    this.socketHub.broadcastToProfile(profile.id, 'Activity/ActivityStarted', {
      activityId: activity.id,
      activityStart,
    });
  }

  public async stopActivity(profileId: ProfileId, activity: GatheringActivityDef) {
    const profile = await this.profileService.getProfileById(profileId);
    if (!profile.activityStart) throw new ServerError(ErrorType.InternalError);

    const activityEnd = new Date();
    const updater = new ServerProfileUpdater(profileId, this.skillService, this.itemService);
    processGatheringActivity(profile.activityStart, activityEnd, activity, updater);

    profile.activityId = null;
    profile.activityStart = null;
    this.profileService.update(profile.id);
    this.socketHub.broadcastToProfile(profile.id, 'Activity/ActivityStopped', {
      activityId: activity.id,
      activityStop: activityEnd,
      items: updater.allItems,
      skills: updater.allSkills,
    });
  }
}
