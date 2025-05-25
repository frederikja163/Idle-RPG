import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import { ProfileService } from '../profile/profile-service';
import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import {
  activities,
  type ActivityId,
  type GatheringActivityDef,
  type ProcessingActivityDef,
} from '@/shared/definition/definition-activities';
import type { ServerData } from '@/shared/socket/socket-types';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import { ErrorType, ServerError } from '@/shared/socket/socket-errors';
import { GatheringService } from './gathering-service';
import { ProcessingService } from './processing-service';

@injectableSingleton(SocketOpenEventToken)
export class ActivityController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileService: ProfileService,
    private readonly gatheringService: GatheringService,
    private readonly processingService: ProcessingService,
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
        break;
      case 'processing':
        await this.processingService.startActivity(profileId, activity as ProcessingActivityDef);
        break;
      default:
        throw new ServerError(ErrorType.InternalError);
    }
  }

  private async handleGetActivity(socket: ServerSocket, _: ServerData<'Activity/GetActivity'>) {
    const profileId = this.socketHub.requireProfileId(socket.id);
    const { activityId, activityStart } = await this.profileService.getProfileById(profileId);
    if (!activityId || !activityStart) return socket.send('Activity/NoActivity', {});
    const activity = this.getActivity(activityId);
    socket.send('Activity/ActivityStarted', { activityId, activityStart });
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
        break;
      case 'processing':
        await this.processingService.stopActivity(profileId, activity as ProcessingActivityDef);
        break;
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
