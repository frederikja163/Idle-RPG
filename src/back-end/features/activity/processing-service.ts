import type { ProcessingActivityDef } from '@/shared/definition/definition-activities';
import type { ActivityService } from './activity-service';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import { ErrorType, ServerError } from '@/shared/socket/socket-errors';
import { getActionCount } from '@/shared/util/util-activities';
import { addXp } from '@/shared/util/util-skills';
import { ItemService } from '../item/item-service';
import { ProfileService } from '../profile/profile-service';
import { SkillService } from '../skill/skill-service';

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

  public async stopActivity(profileId: ProfileId, activity: ProcessingActivityDef) {
    const profile = await this.profileService.getProfileById(profileId);
    if (!profile.activityStart) throw new ServerError(ErrorType.InternalError);

    const activityStop = new Date();
    const actionCount = Math.floor(getActionCount(profile.activityStart, activity.time, activityStop));

    const skill = await this.skillService.getSkillById(profile.id, activity.skill);
    addXp(skill, activity.xpAmount * actionCount);
    this.skillService.update(profile.id, skill.skillId);

    const item = await this.itemService.getItemById(profile.id, activity.resultId);
    addItems(item, actionCount);
    this.itemService.updateItem(profile.id, item.itemId);

    profile.activityId = null;
    profile.activityStart = null;
    this.profileService.update(profile.id);
    this.socketHub.broadcastToProfile(profile.id, 'Activity/ActivityStopped', {
      activityId: activity.id,
      activityStop,
      items: [item],
      skills: [skill],
    });
  }
}
