import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import { ProfileService } from '../profile/profile-service';
import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import type { ServerData } from '@/back-end/core/server/sockets/socket-types';
import { ErrorType } from '@/shared/socket/socket.events';
import type { ProfileId, ProfileType } from '@/back-end/core/db/db.types';
import { SkillService } from '../skill/skill-service';
import { InventoryService } from '../inventory/inventory-service';
import {
  activities,
  type Activity,
  type ActivityId,
  type GatheringActivity,
} from '@/shared/definition/definition.activities';
import { getActionCount } from '@/shared/util/util.activities';
import { addXp } from '@/shared/util/util.skills';

@injectableSingleton(SocketOpenEventToken)
export class ActivityController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileService: ProfileService,
    private readonly skillService: SkillService,
    private readonly inventoryService: InventoryService,
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId);
    socket?.on('Activity/StartActivity', this.handleStartActivity.bind(this));
    socket?.on('Activity/GetActivity', this.handleGetActivity.bind(this));
    socket?.on('Activity/StopActivity', this.handleStopActivity.bind(this));
  }

  private async handleStartActivity(socket: ServerSocket, { activityId }: ServerData<'Activity/StartActivity'>) {
    console.log(activityId);
    const profileId = this.socketHub.getProfileId(socket.id);
    if (!profileId) return socket.error(ErrorType.RequiresProfile);

    const profile = await this.profileService.getProfileById(profileId);
    if (!profile) return socket.error(ErrorType.InternalError);

    const activity = activities.get(activityId);
    if (!activity) return socket.error(ErrorType.InternalError);

    if (profile.activityId && profile.activityStart)
      if (!this.stopActivity(profile, activity, profile.activityStart)) return socket.error(ErrorType.InternalError);

    let success = false;
    switch (activity.type) {
      case 'gathering':
        success = await this.startGathering(profile, activity as GatheringActivity);
        break;
      default:
        return socket.error(ErrorType.InternalError);
    }
    if (!success) return socket.error(ErrorType.InsufficientLevel);

    const activityStart = new Date();
    profile.activityId = activity.id;
    profile.activityStart = activityStart;
    this.profileService.update(profileId);
    this.socketHub.broadcastToProfile(profileId, 'Activity/ActivityStarted', { activityId, activityStart });
  }

  private async handleGetActivity(socket: ServerSocket, {}: ServerData<'Activity/GetActivity'>) {
    const profileId = this.socketHub.getProfileId(socket.id);
    if (!profileId) return socket.error(ErrorType.RequiresProfile);

    const profile = await this.profileService.getProfileById(profileId);
    if (!profile) return socket.error(ErrorType.InternalError);

    const activityId = profile.activityId;
    const activityStart = profile.activityStart;
    if (!activityId || !activityStart) return socket.error(ErrorType.NoActivity);

    socket.send('Activity/ActivityStarted', { activityId, activityStart });
  }

  private async handleStopActivity(socket: ServerSocket, {}: ServerData<'Activity/StopActivity'>) {
    const profileId = this.socketHub.getProfileId(socket.id);
    if (!profileId) return socket.error(ErrorType.RequiresProfile);

    const profile = await this.profileService.getProfileById(profileId);
    if (!profile) return socket.error(ErrorType.InternalError);

    const activityId = profile.activityId;
    const activityStart = profile.activityStart;
    if (!activityId || !activityStart) return socket.error(ErrorType.NoActivity);

    const activity = activities.get(activityId);
    if (!activity) return socket.error(ErrorType.InternalError);

    if (!(await this.stopActivity(profile, activity, activityStart))) {
      socket.error(ErrorType.InternalError);
    }
  }

  private async stopActivity(profile: ProfileType, activity: Activity, activityStart: Date) {
    const activityStop = new Date();
    const actionCount = getActionCount(activityStart, activity.time, activityStop);

    const skill = await this.skillService.getSkillById(profile.id, activity.skill);
    if (!skill) return false;

    const item = await this.inventoryService.getByItemId(profile.id, activity.resultId);
    if (!item) return false;

    addXp(skill, activity.xpAmount * actionCount);
    this.skillService.update(profile.id, skill.skillId);

    item.count += actionCount;
    this.inventoryService.updateItem(profile.id, item.itemId);

    profile.activityId = null;
    profile.activityStart = null;
    this.profileService.update(profile.id);
    this.socketHub.broadcastToProfile(profile.id, 'Activity/ActivityStopped', {
      activityId: activity.id,
      activityStop,
    });

    return true;
  }

  private async startGathering(profile: ProfileType, activity: GatheringActivity) {
    const skill = await this.skillService.getSkillById(profile.id, activity.skill);
    if (!skill) return false;

    if (skill.level < activity.levelRequirement) return false;

    return true;
  }
}
