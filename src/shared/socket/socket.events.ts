import { Type, type Static, type TLiteralValue, type TProperties } from '@sinclair/typebox';

function event<T1 extends TLiteralValue, T2 extends TProperties>(type: T1, data: T2) {
  return Type.Object({ type: Type.Literal(type), data: Type.Object(data) });
}

export enum ErrorType {
  NotImplemented, // = "This is not implemented yet.",
  InternalError, // = "The server experienced an internal error handling your request, try again.",
  InvalidInput, // = "The input was invalid, so the action could not be performed.",
  EmailNotVerified, // = "Email is not verified.",
  RequiresLogin, // = "You must login to do this.",
  ProfileInUse, // = "This profile is already in use, please make sure you log out on all devices before deleting a profile.",
  NameTaken, // = "A profile with this name already exists.",
  ArgumentOutOfRange, // = "Provided argument is out of range.",
  RequiresProfile, // = "You must select a profile to do this."
}

export const profileDto = Type.Object({
  name: Type.String(),
});
export type ProfileDto = Static<typeof profileDto>;

export const itemDto = Type.Object({
  itemId: Type.String(),
  count: Type.Number(),
});
export type ItemDto = Static<typeof itemDto>;
export const inventoryDto = Type.Array(itemDto);
export type InventoryDto = Static<typeof inventoryDto>;

export const skillDto = Type.Object({
  skillId: Type.String(),
  level: Type.Number(),
  xp: Type.Number(),
});
export const skillsDto = Type.Array(skillDto);

export const clientServerEvent = Type.Union([
  // Pong
  event('Ping', {}),
  // Auth/LoginSuccess
  // Error: EmailNotVerified
  event('Auth/GoogleLogin', { token: Type.String() }),
  // Auth/LogoutSuccess
  event('Auth/Logout', {}),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin
  event('Profile/GetProfiles', {}),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, NameTaken
  event('Profile/CreateProfile', { name: Type.String() }),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, ProfileInUse, ArgumentOutOfRange
  event('Profile/DeleteProfile', { index: Type.Number() }),
  // Profiles/SelectProfileSuccess
  // Error: RequiresLogin, ArgumentOutOfRange
  event('Profile/SelectProfile', { index: Type.Number() }),
  // Inventory/UpdateInventory
  // Error: RequiresProfile
  event('Inventory/GetInventory', {}),
  // Inventory/UpdateInventory
  // Error: RequiresProfile, ArgumentOutOfRange
  event('Inventory/SwapItems', {
    index1: Type.Number(),
    index2: Type.Number(),
  }),
  // Skill/UpdateSkills
  // Error: RequiresProfile
  event('Skill/GetSkills', {}),
  // Activity/ActivityStarted
  // Error: RequiresProfile
  event('Activity/StartActivity', { activityId: Type.String() }),
  // Activity/ActivityStarted
  // Error: RequiresProfile
  event('Activity/GetActivity', {}),
]);
export type ClientServerEvent = typeof clientServerEvent;

export const serverClientEvent = Type.Union([
  event('Pong', {}),
  event('Error', { error: Type.Enum(ErrorType) }),
  event('Auth/LoginSuccess', {}),
  event('Auth/LogoutSuccess', {}),
  event('Profile/UpdateProfiles', { profiles: Type.Array(profileDto) }),
  event('Profile/SelectProfileSuccess', {}),
  event('Inventory/UpdateInventory', { items: inventoryDto }),
  event('Skill/UpdateSkills', { skills: skillsDto }),
  event('Activity/ActivityStarted', { activityId: Type.String(), time: Type.Number() }),
]);
export type ServerClientEvent = typeof serverClientEvent;
