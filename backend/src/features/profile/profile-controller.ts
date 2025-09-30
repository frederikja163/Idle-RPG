import { ProfileEventDispatcher } from '@/backend/core/events/profile-dispatcher';
import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/backend/core/events/socket-event';
import { SocketHub } from '@/backend/core/server/sockets/socket-hub';
import { injectableSingleton } from '@/backend/core/lib/lib-tsyringe';
import { ProfileService } from './profile-service';
import type { Activity, ClientData, ServerData, SocketId } from '@/shared/socket/socket-types';
import { ErrorType, ServerError } from '@/shared/socket/socket-errors';
import { ItemService } from '../item/item-service';
import { SkillService } from '../skill/skill-service';
import {
  transformQuery,
  transformQueryMany,
  updateValue,
  updateValueMany,
} from '@/backend/core/lib/lib-query-transform';
import type { ProfileId } from '@/shared/definition/schema/types/types-profiles';
import { ServerProfileInterface } from './profile-interface';
import { canStartCrafting, processCrafting } from '@/shared/util/util-crafting';
import { CraftingRecipeDef } from '@/shared/definition/definition-crafting';

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

  private async handleActivityReplace(socketId: SocketId, activityDto: ServerData<'Profile/ActivityReplace'>) {
    const profileId = this.socketHub.requireProfileId(socketId);
    const profile = await this.profileService.getProfileById(profileId);

    this.isActivityTypeValid(activityDto.type);

    const { items, skills } = await this.calculateActivity(profileId);
    skills.forEach((s) => this.skillService.update(profileId, s.id));
    items.forEach((i) => this.itemService.update(profileId, i.id));

    try {
      profile.activity = await this.startActivity(profileId, activityDto);
      this.profileService.update(profileId);
    } catch (error) {
      profile.activity = { type: 'none', start: new Date().getTime() };
      this.profileService.update(profileId);
      throw error;
    } finally {
      this.socketHub.broadcastToProfile(profileId, 'Profile/Updated', {
        profile: {
          activity: profile.activity,
        },
        items,
        skills,
      });
    }
  }

  private isActivityTypeValid(activityType: Activity['type']) {
    switch (activityType) {
      case 'none':
      case 'crafting':
        break;
      default:
        throw new ServerError(ErrorType.InvalidActivity);
    }
  }

  private async calculateActivity(profileId: ProfileId) {
    const profile = await this.profileService.getProfileById(profileId);
    const activity = profile.activity;

    switch (activity.type) {
      case 'none':
        return { skills: [], items: [] };
      case 'crafting': {
        const recipe = CraftingRecipeDef.requireById(activity.recipeId);

        const { items, skills } = await processCrafting(
          activity.start,
          new Date().getTime(),
          recipe.id,
          new ServerProfileInterface(profileId, this.skillService, this.itemService),
        );
        return { items, skills };
      }
      default:
        throw new ServerError(
          ErrorType.InternalError,
          'Existing activity type is not valid. Contact a server admin to help solve this issue.',
        );
    }
  }

  private async startActivity(
    profileId: ProfileId,
    activityDto: ServerData<'Profile/ActivityReplace'>,
  ): Promise<Activity> {
    switch (activityDto.type) {
      case 'none':
        return { type: 'none', start: new Date().getTime() };
      case 'crafting': {
        const recipe = CraftingRecipeDef.getById(activityDto.recipeId);
        if (!recipe) throw new ServerError(ErrorType.InternalError, 'Crafting recipe not found.');
        const error = await canStartCrafting(
          recipe.id,
          new ServerProfileInterface(profileId, this.skillService, this.itemService),
        );
        if (error) throw new ServerError(error);

        return {
          type: 'crafting',
          start: new Date().getTime(),
          recipeId: recipe.id,
        };
      }
      default:
        throw new ServerError(ErrorType.InvalidActivity);
    }
  }
}
