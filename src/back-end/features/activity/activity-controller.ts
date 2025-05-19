import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import { ProfileService } from '../profile/profile-service';
import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import { SkillService } from '../skill/skill-service';
import { ItemService } from '../item/item-service';
import { activities, type ActivityId, type GatheringActivityDef } from '@/shared/definition/definition-activities';
import { getActionCount } from '@/shared/util/util-activities';
import { addXp } from '@/shared/util/util-skills';
import type { ServerData } from '@/shared/socket/socket-types';
import type { Profile, ProfileId } from '@/shared/definition/schema/types/types-profiles';
import { ErrorType, ServerError } from '@/shared/socket/socket-errors';
import type { GatheringService } from './gathering-service';

@injectableSingleton(SocketOpenEventToken)
export class ActivityController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileService: ProfileService,
    private readonly gatheringService: GatheringService,
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId);
    socket?.on('Activity/StartActivity', this.handleStartActivity.bind(this));
    socket?.on('Activity/GetActivity', this.handleGetActivity.bind(this));
    socket?.on('Activity/StopActivity', this.handleStopActivity.bind(this));
  }

  private async handleStartActivity(socket: ServerSocket, { activityId }: ServerData<'Activity/StartActivity'>) {
    const profileId = this.socketHub.requireProfileId(socket.id);
    const { activityId: oldActivityId } = await this.profileService.getProfileById(profileId);
    const activity = this.getActivity(activityId);

    if (oldActivityId) {
      this.stopActivity(profileId, oldActivityId);
    }

    switch (activity.type) {
      case 'gathering':
        await this.gatheringService.startActivity(profileId, activity as GatheringActivityDef);
      default:
        throw new ServerError(ErrorType.InternalError);
    }
  }

  private async handleGetActivity(socket: ServerSocket, _: ServerData<'Activity/GetActivity'>) {
    const profileId = this.socketHub.requireProfileId(socket.id);
    const { activityId, activityStart } = await this.profileService.getProfileById(profileId);
    if (!activityId || !activityStart) return socket.send('Activity/NoActivity', {});
    const activity = this.getActivity(activityId);
    switch (activity.type) {
      case 'gathering':
        socket.send('Activity/ActivityStarted', { activityId, activityStart });
    }
  }

  private async handleStopActivity(socket: ServerSocket, _: ServerData<'Activity/StopActivity'>) {
    const profileId = this.socketHub.requireProfileId(socket.id);
    const { activityId } = await this.profileService.getProfileById(profileId);
    if (!activityId) throw new ServerError(ErrorType.NoActivity);
    await this.stopActivity(profileId, activityId);
  }

  private async stopActivity(profileId: ProfileId, activityId: ActivityId) {
    const activity = this.getActivity(activityId);
    switch (activity.type) {
      case 'gathering':
        await this.gatheringService.stopActivity(profileId, activity as GatheringActivityDef);
      default:
        throw new ServerError(ErrorType.InternalError);
    }
  }

  private getActivity(activityId: ActivityId) {
    const activity = activities.get(activityId);
    if (!activity) throw new ServerError(ErrorType.InternalError, 'Activity not found.');
    return activity;
  }
}
