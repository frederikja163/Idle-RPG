import { Type, type TLiteralValue, type TProperties } from '@sinclair/typebox';
import { createSelectSchema } from 'drizzle-typebox';
import { profilesTable } from '../definition/schema/db/db-profiles';
import { itemsTable } from '../definition/schema/db/db-items';
import { skillsTable } from '../definition/schema/db/db-skills';
import { ErrorType } from './socket-errors';

const profileDto = createSelectSchema(profilesTable);
const itemDto = createSelectSchema(itemsTable);
const skillDto = createSelectSchema(skillsTable);

export const clientServerEvent = Type.Union([
  // Auth/LoginSuccess
  // Error: EmailNotVerified
  event('Auth/GoogleLogin', { token: Type.String() }),
  // Auth/LogoutSuccess
  // Error: RequiresLogin
  event('Auth/Logout', {}),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin
  event('Profile/GetProfiles', {}),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, NameTaken
  event('Profile/CreateProfile', { name: Type.String() }),
  // Profiles/SelectProfileSuccess
  // Error: RequiresLogin, ArgumentOutOfRange
  event('Profile/SelectProfile', { profileId: Type.String() }),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, ProfileInUse, ArgumentOutOfRange
  event('Profile/DeleteProfile', { profileId: Type.String() }),
  // Item/UpdateItems
  // Error: RequiresProfile
  event('Item/GetItems', { itemIds: Type.Optional(Type.Array(Type.String())) }),
  // Item/UpdateItems
  // Error: RequiresProfile, ArgumentOutOfRange
  event('Item/ChangeIndicies', {
    itemIndicies: Type.Array(Type.Object({ itemId: Type.String(), index: Type.Number() })),
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
  event('Auth/LoginSuccess', {}),
  event('Auth/LogoutSuccess', {}),
  event('Profile/UpdateProfiles', { profiles: Type.Array(profileDto) }),
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
