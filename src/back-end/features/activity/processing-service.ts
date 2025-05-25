import type { ProcessingActivityDef } from '@/shared/definition/definition-activities';
import type { ActivityService } from './activity-service';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import { ErrorType, ServerError } from '@/shared/socket/socket-errors';
import { getActionCount, processProcessingActivity } from '@/shared/util/util-activities';
import { addXp } from '@/shared/util/util-skills';
import { ItemService } from '../item/item-service';
import { ProfileService } from '../profile/profile-service';
import { SkillService } from '../skill/skill-service';
import { ServerProfileUpdater } from '../profile/profile-updater';

export class ProcessingService implements ActivityService<ProcessingActivityDef> {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileService: ProfileService,
    private readonly skillService: SkillService,
    private readonly itemService: ItemService,
  ) {}

  public async startActivity(profileId: ProfileId, activity: ProcessingActivityDef) {
    const profile = await this.profileService.getProfileById(profileId);
    const skill = await this.skillService.getSkillById(profileId, activity.skill);
    const item = await this.itemService.getItemById(profileId, activity.costId);
    if (skill.level < activity.levelRequirement) throw new ServerError(ErrorType.InsufficientLevel);
    if (item.count < 1) throw new ServerError(ErrorType.InsufficientItems);

    const activityStart = new Date();
    profile.activityId = activity.id;
    profile.activityStart = activityStart;
    this.profileService.update(profile.id);
    this.socketHub.broadcastToProfile(profile.id, 'Activity/ActivityStarted', {
      activityId: activity.id,
      activityStart,
    });
  }

  public async stopActivity(profileId: ProfileId, activity: ProcessingActivityDef) {
    const profile = await this.profileService.getProfileById(profileId);
    if (!profile.activityStart) throw new ServerError(ErrorType.InternalError);

    const activityEnd = new Date();
    const updater = new ServerProfileUpdater(profileId, this.skillService, this.itemService);
    processProcessingActivity(profile.activityStart, activityEnd, activity, updater);

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
