import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from "@/back-end/core/events/socket-event";
import { injectableSingleton } from "@/back-end/core/lib/lib-tsyringe";
import { SocketHub } from "@/back-end/core/server/sockets/socket-hub";
import { ProfileService } from "../profile/profile-service";
import type { ServerSocket } from "@/back-end/core/server/sockets/server-socket";
import { SkillService } from "../skill/skill-service";
import { InventoryService } from "../inventory/inventory-service";
import {
  activities,
  type ActivityDef,
  type GatheringActivityDef,
} from "@/shared/definition/definition-activities";
import { getActionCount } from "@/shared/util/util-activities";
import { addXp } from "@/shared/util/util-skills";
import type { ServerData } from "@/shared/socket/socket-types";
import type { Profile } from "@/shared/definition/schema/types/types-profiles";
import { ErrorType, ServerError } from "@/shared/socket/socket-errors";

@injectableSingleton(SocketOpenEventToken)
export class ActivityController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileService: ProfileService,
    private readonly skillService: SkillService,
    private readonly inventoryService: InventoryService
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId);
    socket?.on("Activity/StartActivity", this.handleStartActivity.bind(this));
    socket?.on("Activity/GetActivity", this.handleGetActivity.bind(this));
    socket?.on("Activity/StopActivity", this.handleStopActivity.bind(this));
  }

  private async handleStartActivity(
    socket: ServerSocket,
    { activityId }: ServerData<"Activity/StartActivity">
  ) {
    const profileId = this.socketHub.requireProfileId(socket.id);
    const profile = await this.profileService.getProfileById(profileId);

    const activity = activities.get(activityId);
    if (!activity) return socket.error(ErrorType.InternalError);

    if (profile.activityId && profile.activityStart) {
      this.stopActivity(
        profile,
        activities.get(activityId)!,
        profile.activityStart
      );
      return socket.error(ErrorType.InternalError);
    }

    switch (activity.type) {
      case "gathering":
        await this.startGathering(profile, activity as GatheringActivityDef);
        break;
      default:
        return socket.error(ErrorType.InternalError);
    }

    const activityStart = new Date();
    profile.activityId = activity.id;
    profile.activityStart = activityStart;
    this.profileService.update(profileId);
    this.socketHub.broadcastToProfile(profileId, "Activity/ActivityStarted", {
      activityId,
      activityStart,
    });
  }

  private async handleGetActivity(
    socket: ServerSocket,
    _: ServerData<"Activity/GetActivity">
  ) {
    const profileId = this.socketHub.requireProfileId(socket.id);
    const profile = await this.profileService.getProfileById(profileId);

    const activityId = profile.activityId;
    const activityStart = profile.activityStart;
    if (!activityId || !activityStart)
      return socket.error(ErrorType.NoActivity);

    socket.send("Activity/ActivityStarted", { activityId, activityStart });
  }

  private async handleStopActivity(
    socket: ServerSocket,
    _: ServerData<"Activity/StopActivity">
  ) {
    const profileId = this.socketHub.requireProfileId(socket.id);

    const profile = await this.profileService.getProfileById(profileId);

    const activityId = profile.activityId;
    const activityStart = profile.activityStart;
    if (!activityId || !activityStart)
      return socket.error(ErrorType.NoActivity);

    const activity = activities.get(activityId);
    if (!activity) return socket.error(ErrorType.InternalError);

    await this.stopActivity(profile, activity, activityStart);
  }

  private async stopActivity(
    profile: Profile,
    activity: ActivityDef,
    activityStart: Date
  ) {
    const activityStop = new Date();
    const actionCount = getActionCount(
      activityStart,
      activity.time,
      activityStop
    );

    const skill = await this.skillService.getSkillById(
      profile.id,
      activity.skill
    );

    const item = await this.inventoryService.getItemById(
      profile.id,
      activity.resultId
    );

    addXp(skill, activity.xpAmount * actionCount);
    this.skillService.update(profile.id, skill.skillId);

    item.count += actionCount;
    this.inventoryService.updateItem(profile.id, item.itemId);

    profile.activityId = null;
    profile.activityStart = null;
    this.profileService.update(profile.id);
    this.socketHub.broadcastToProfile(profile.id, "Activity/ActivityStopped", {
      activityId: activity.id,
      activityStop,
    });
  }

  private async startGathering(
    profile: Profile,
    activity: GatheringActivityDef
  ) {
    const skill = await this.skillService.getSkillById(
      profile.id,
      activity.skill
    );

    if (skill.level < activity.levelRequirement)
      throw new ServerError(ErrorType.InsufficientLevel);
  }
}
