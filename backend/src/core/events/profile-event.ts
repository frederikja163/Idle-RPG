import type { Profile, ProfileId } from '@/shared/definition/schema/types/types-profiles';
import type { UserId } from '@/shared/definition/schema/types/types-user';
import type { InjectionToken } from 'tsyringe';

export type ProfileSelectedEventData = { userId: UserId; profileId: ProfileId };
export interface ProfileSelectedEventListener {
  onProfileSelected(event: ProfileSelectedEventData): void | Promise<void>;
}
export const ProfileSelectedEventToken: InjectionToken<ProfileSelectedEventListener> = Symbol('ProfileSelected');

export type ProfileDeselectedEventData = { userId: UserId; profileId: ProfileId };
export interface ProfileDeselectedEventListener {
  onProfileDeselected(event: ProfileDeselectedEventData): void | Promise<void>;
}
export const ProfileDeselectedEventToken: InjectionToken<ProfileDeselectedEventListener> = Symbol('ProfileDeselected');

export type ProfileCreatedEventData = { userId: UserId; profile: Profile };
export interface ProfileCreatedEventListener {
  onProfileCreated(event: ProfileCreatedEventData): void | Promise<void>;
}
export const ProfileCreatedEventToken: InjectionToken<ProfileCreatedEventListener> = Symbol('ProfileCreated');

export type ProfileDeletedEventData = { userId: UserId; profileId: ProfileId };
export interface ProfileDeletedEventListener {
  onProfileDeleted(event: ProfileDeletedEventData): void | Promise<void>;
}
export const ProfileDeletedEventToken: InjectionToken<ProfileDeletedEventListener> = Symbol('ProfileDeleted');
