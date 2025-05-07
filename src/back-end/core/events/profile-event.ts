import type { InjectionToken } from 'tsyringe';
import type { ProfileId, ProfileType, UserId } from '../db/db.types';

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

export type ProfileCreatedEventData = { userId: UserId; profile: ProfileType };
export interface ProfileCreatedEventListener {
  onProfileCreated(event: ProfileCreatedEventData): void | Promise<void>;
}
export const ProfileCreatedEventToken: InjectionToken<ProfileCreatedEventListener> = Symbol('ProfileCreated');

export type ProfileDeletedEventData = { userId: UserId; profileId: ProfileId };
export interface ProfileDeletedEventListener {
  onProfileDeleted(event: ProfileDeletedEventData): void | Promise<void>;
}
export const ProfileDeletedEventToken: InjectionToken<ProfileDeletedEventListener> = Symbol('ProfileDeleted');
