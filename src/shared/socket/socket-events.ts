import { Type, type TLiteralValue, type TProperties } from '@sinclair/typebox';
import { createSelectSchema } from 'drizzle-typebox';
import { profilesTable } from '../definition/schema/db/db-profiles';
import { itemsTable } from '../definition/schema/db/db-items';
import { skillsTable } from '../definition/schema/db/db-skills';
import { ErrorType } from './socket-errors';
import { usersTable } from '../definition/schema/db/db-users';

const userDto = createSelectSchema(usersTable);
const profileDto = createSelectSchema(profilesTable);
const itemDto = createSelectSchema(itemsTable);
const skillDto = createSelectSchema(skillsTable);

export const clientServerEvent = Type.Union([
  // User/LoginSuccess
  // Error: EmailNotVerified
  event('User/GoogleLogin', { token: Type.String() }),
  // User/LogoutSuccess
  // Error: RequiresLogin
  event('User/Logout', {}),
  // User/UpdateUser
  // Error: RequiresLogin
  event('User/SetSettings', { settings: Type.String() }),
  // User/UpdateUser
  // Error: RequiresLogin
  event('User/GetUser', {}),
  // Profile/UpdateProfiles
  // Error: RequiresLogin
  event('Profile/GetProfiles', {}),
  // Profile/UpdateProfile
  // Error: RequiresProfile
  event('Profile/GetProfile', {}),
  // Profile/UpdateProfile
  // Error: RequiresProfile
  event('Profile/SetSettings', { settings: Type.String() }),
  // Profile/UpdateProfiles
  // Error: RequiresLogin, NameTaken
  event('Profile/CreateProfile', { name: Type.String() }),
  // Profile/SelectProfileSuccess
  // Error: RequiresLogin, ArgumentOutOfRange
  event('Profile/SelectProfile', { profileId: Type.String() }),
  // Profile/UpdateProfiles
  // Error: RequiresLogin, ProfileInUse, ArgumentOutOfRange
  event('Profile/DeleteProfile', { profileId: Type.String() }),
  // Item/UpdateItems
  // Error: RequiresProfile
  event('Item/GetItems', { itemIds: Type.Optional(Type.Array(Type.String())) }),
  // Item/UpdateItems
  // Error: RequiresProfile, ArgumentOutOfRange
  event('Item/SwapItems', {
    itemId1: Type.String(),
    itemId2: Type.String(),
  }),
  // Skill/UpdateSkills
  // Error: RequiresProfile
  event('Skill/GetSkills', { skillIds: Type.Optional(Type.Array(Type.String())) }),
  // Activity/ActivityStarted
  // Error: RequiresProfile, InsufficientLevel, InsufficientItems
  event('Activity/StartActivity', { activityId: Type.String() }),
  // Activity/ActivityStopped
  // Error: RequiresProfile, NoActivity
  event('Activity/StopActivity', {}),
  // Activity/ActivityStarted, Activity/NoActivity
  // Error: RequiresProfile
  event('Activity/GetActivity', {}),
]);

export const serverClientEvent = Type.Union([
  event('System/Error', {
    errorType: Type.Enum(ErrorType),
    message: Type.Optional(Type.String()),
  }),
  event('System/Shutdown', {
    reason: Type.String(),
    time: Type.Date(),
  }),
  event('User/LoginSuccess', {}),
  event('User/LogoutSuccess', {}),
  event('User/UpdateUser', { user: userDto }),
  event('Profile/UpdateProfiles', { profiles: Type.Array(profileDto) }),
  event('Profile/UpdateProfile', { profile: profileDto }),
  event('Profile/SelectProfileSuccess', {}),
  event('Item/UpdateItems', { items: Type.Array(itemDto) }),
  event('Skill/UpdateSkills', { skills: Type.Array(skillDto) }),
  event('Activity/ActivityStarted', {
    activityId: Type.String(),
    activityStart: Type.Date(),
  }),
  event('Activity/ActivityStopped', {
    activityId: Type.String(),
    activityStop: Type.Date(),
    items: Type.Array(itemDto),
    skills: Type.Array(skillDto),
  }),
  event('Activity/NoActivity', {}),
]);

function event<T1 extends TLiteralValue, T2 extends TProperties>(type: T1, data: T2) {
  return Type.Object({ type: Type.Literal(type), data: Type.Object(data) });
}
