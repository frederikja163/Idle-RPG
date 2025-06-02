import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import { ProfileService } from '../profile/profile-service';
import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import { activities, type ActivityId } from '@/shared/definition/definition-activities';
import type { ServerData, SocketId } from '@/shared/socket/socket-types';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import { ErrorType, ServerError } from '@/shared/socket/socket-errors';
import { canStartActivity as getActivityStartError, processActivity } from '@/shared/util/util-activities';
import { ServerProfileInterface } from '../profile/profile-interface';
import { ItemService } from '../item/item-service';
import { SkillService } from '../skill/skill-service';

@injectableSingleton(SocketOpenEventToken)
export class ActivityController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileService: ProfileService,
    private readonly itemService: ItemService,
    private readonly skillService: SkillService,
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.requireSocket(socketId);
    socket?.on('Activity/StartActivity', this.handleStartActivity.bind(this));
    socket?.on('Activity/GetActivity', this.handleGetActivity.bind(this));
    socket?.on('Activity/StopActivity', this.handleStopActivity.bind(this));
  }

  private async handleStartActivity(socketId: SocketId, { activityId }: ServerData<'Activity/StartActivity'>) {
    const profileId = this.socketHub.requireProfileId(socketId);

    await this.stopActivity(profileId);

    await this.startActivity(profileId, activityId);
  }

  private async handleGetActivity(socketId: SocketId, _: ServerData<'Activity/GetActivity'>) {
    const profileId = this.socketHub.requireProfileId(socketId);
    const { activityId, activityStart } = await this.profileService.getProfileById(profileId);
    if (!activityId || !activityStart) return this.socketHub.broadcastToSocket(socketId, 'Activity/NoActivity', {});
    this.socketHub.broadcastToSocket(socketId, 'Activity/ActivityStarted', { activityId, activityStart });
  }

  private async handleStopActivity(socketId: SocketId, _: ServerData<'Activity/StopActivity'>) {
    const profileId = this.socketHub.requireProfileId(socketId);
    if (!(await this.stopActivity(profileId))) {
      this.socketHub.broadcastToSocket(socketId, 'Activity/NoActivity', {});
    }
  }

  private async stopActivity(profileId: ProfileId) {
    const profile = await this.profileService.getProfileById(profileId);

    if (!profile.activityId || !profile.activityStart) return false;

    const activity = this.getActivity(profile.activityId);
    const activityEnd = new Date();

    const { items, skills } = await processActivity(
      profile.activityStart,
      activityEnd,
      activity,
      new ServerProfileInterface(profileId, this.skillService, this.itemService),
    );

    skills.forEach((s) => this.skillService.update(profileId, s.skillId));
    items.forEach((i) => this.itemService.update(profileId, i.itemId));

    profile.activityId = null;
    profile.activityStart = null;
    this.profileService.update(profile.id);
    this.socketHub.broadcastToProfile(profile.id, 'Activity/ActivityStopped', {
      activityId: activity.id,
      activityStop: activityEnd,
      items,
      skills,
    });
    return true;
  }

  private async startActivity(profileId: ProfileId, activityId: ActivityId) {
    const activity = this.getActivity(activityId);
    const error = await getActivityStartError(
      activity,
      new ServerProfileInterface(profileId, this.skillService, this.itemService),
    );
    if (error) throw new ServerError(error);

    const profile = await this.profileService.getProfileById(profileId);

    const activityStart = new Date();
    profile.activityId = activity.id;
    profile.activityStart = activityStart;
    this.profileService.update(profile.id);
    this.socketHub.broadcastToProfile(profile.id, 'Activity/ActivityStarted', {
      activityId: activity.id,
      activityStart,
    });
  }

  private getActivity(activityId: ActivityId) {
    const activity = activities.get(activityId);
    if (!activity) throw new ServerError(ErrorType.InternalError, 'Activity not found.');
    return activity;
  }
}
