import { ProfileEventDispatcher } from '@/back-end/core/events/profile-dispatcher';
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { ProfileService } from './profile-service';
import type { ClientData, ServerData, SocketId } from '@/shared/socket/socket-types';
import { ErrorType, ServerError } from '@/shared/socket/socket-errors';
import { ItemService } from '../item/item-service';
import { SkillService } from '../skill/skill-service';
import {
  transformQuery,
  transformQueryMany,
  updateValue,
  updateValueMany,
} from '@/back-end/core/lib/lib-query-transform';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import { activities, NoActivity, type ActivityId } from '@/shared/definition/definition-activities';
import { ServerProfileInterface } from './profile-interface';
import { canStartActivity, processActivity } from '@/shared/util/util-activities';

@injectableSingleton(SocketOpenEventToken)
export class ProfileController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly profileService: ProfileService,
    private readonly itemService: ItemService,
    private readonly skillService: SkillService,
    private readonly profileEventDispatcher: ProfileEventDispatcher,
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.requireSocket(socketId)!;
    socket.on('Profile/QueryMany', this.handleQueryMany.bind(this));
    socket.on('Profile/Query', this.handleQuery.bind(this));
    socket.on('Profile/Update', this.handleUpdate.bind(this));
    socket.on('Profile/Delete', this.handleDeleteProfile.bind(this));
    socket.on('Profile/Create', this.handleCreateProfile.bind(this));
    socket.on('Profile/Select', this.handleSelectProfile.bind(this));
    socket.on('Profile/ActivityReplace', this.handleActivityReplace.bind(this));
  }

  private async handleQueryMany(socketId: SocketId, { profiles }: ServerData<'Profile/QueryMany'>) {
    const userId = this.socketHub.requireUserId(socketId);
    const profilesResult = transformQueryMany(await this.profileService.getProfilesByUserId(userId), profiles);

    this.socketHub.broadcastToSocket(socketId, 'Profile/UpdatedMany', {
      profiles: profilesResult,
    });
  }

  private async handleQuery(socketId: SocketId, { profile, items, skills }: ServerData<'Profile/Query'>) {
    const profileId = this.socketHub.requireProfileId(socketId);
    const profileResult = profile && transformQuery(await this.profileService.getProfileById(profileId), profile);
    const itemsResult = items && transformQueryMany(await this.itemService.getItemsByProfileId(profileId), items);
    const skillResult = skills && transformQueryMany(await this.skillService.getSkillsByProfileId(profileId), skills);

    this.socketHub.broadcastToSocket(socketId, 'Profile/Updated', {
      profile: profileResult,
      items: itemsResult,
      skills: skillResult,
    });
  }

  private async handleUpdate(socketId: SocketId, { profile, items, skills }: ServerData<'Profile/Update'>) {
    const profileId = this.socketHub.requireProfileId(socketId);
    const result: Partial<ClientData<'Profile/Updated'>> = {};

    if (profile) {
      result.profile = updateValue(await this.profileService.getProfileById(profileId), profile);
      this.profileService.update(profileId);
    }
    if (items) {
      result.items = updateValueMany(await this.itemService.getItemsByProfileId(profileId), items);
      this.itemService.updateMany(
        profileId,
        result.items.map((i) => i.id!),
      );
    }
    if (skills) {
      result.skills = updateValueMany(await this.skillService.getSkillsByProfileId(profileId), skills);
      this.skillService.updateMany(
        profileId,
        result.skills.map((s) => s.id!),
      );
    }

    this.socketHub.broadcastToProfile(profileId, 'Profile/Updated', result);
  }

  private async handleCreateProfile(socketId: SocketId, { name }: ServerData<'Profile/Create'>) {
    const userId = this.socketHub.requireUserId(socketId);

    await this.profileService.create(userId, {
      name,
      activityId: NoActivity,
      activityStart: null,
    });

    const profiles = await this.profileService.getProfilesByUserId(userId);
    this.socketHub.broadcastToUser(userId, 'Profile/UpdatedMany', {
      profiles: profiles,
    });
  }

  private async handleDeleteProfile(socketId: SocketId, { profileId }: ServerData<'Profile/Delete'>) {
    const userId = this.socketHub.requireUserId(socketId);
    await this.profileService.requireUserHasAccess(userId, profileId);

    if (this.socketHub.anySocketsForProfile(profileId)) throw new ServerError(ErrorType.ProfileInUse);

    const profile = await this.profileService.getProfileById(profileId);
    await this.profileService.delete(userId, profile.id);
    const profiles = await this.profileService.getProfilesByUserId(userId);
    this.socketHub.broadcastToUser(userId, 'Profile/UpdatedMany', {
      profiles,
    });
  }

  private async handleSelectProfile(socketId: SocketId, { profileId }: ServerData<'Profile/Select'>) {
    const userId = this.socketHub.requireUserId(socketId);
    await this.profileService.requireUserHasAccess(userId, profileId);

    const oldProfileId = this.socketHub.getProfileId(socketId);
    if (oldProfileId) {
      this.profileEventDispatcher.emitProfileDeselected({
        userId,
        profileId: oldProfileId,
      });
    }

    const profile = await this.profileService.getProfileById(profileId);
    this.socketHub.setProfileId(socketId, profile.id);
    this.profileEventDispatcher.emitProfileSelected({
      userId,
      profileId: profile.id,
    });
    this.socketHub.broadcastToSocket(socketId, 'Profile/Updated', {
      profile: { id: profileId },
      items: [],
      skills: [],
    });
  }

  private async handleActivityReplace(socketId: SocketId, { activityId }: ServerData<'Profile/ActivityReplace'>) {
    const profileId = this.socketHub.requireProfileId(socketId);
    await this.stopActivity(profileId);
    if (activityId != NoActivity) {
      const activityStart = await this.startActivity(profileId, activityId);
      this.socketHub.broadcastToProfile(profileId, 'Profile/Updated', {
        profile: {
          activityId,
          activityStart,
        },
      });
      return;
    }
    this.socketHub.broadcastToProfile(profileId, 'Profile/Updated', {
      profile: {
        activityId: NoActivity,
      },
    });
  }

  private async stopActivity(profileId: ProfileId) {
    const profile = await this.profileService.getProfileById(profileId);

    if (!profile.activityId || !profile.activityStart) return;

    const activity = this.getActivity(profile.activityId);
    const activityEnd = new Date();

    const { items, skills } = await processActivity(
      profile.activityStart,
      activityEnd,
      activity,
      new ServerProfileInterface(profileId, this.skillService, this.itemService),
    );

    skills.forEach((s) => this.skillService.update(profileId, s.id));
    items.forEach((i) => this.itemService.update(profileId, i.id));

    profile.activityId = NoActivity;
    profile.activityStart = null;
    this.profileService.update(profile.id);
  }

  private async startActivity(profileId: ProfileId, activityId: ActivityId) {
    const activity = this.getActivity(activityId);
    const error = await canStartActivity(
      activity,
      new ServerProfileInterface(profileId, this.skillService, this.itemService),
    );
    if (error) throw new ServerError(error);

    const profile = await this.profileService.getProfileById(profileId);

    const activityStart = new Date();
    profile.activityId = activity.id;
    profile.activityStart = activityStart;
    this.profileService.update(profile.id);
    return activityStart;
  }

  private getActivity(activityId: ActivityId) {
    const activity = activities.get(activityId);
    if (!activity) throw new ServerError(ErrorType.InternalError, 'Activity not found.');
    return activity;
  }
}
