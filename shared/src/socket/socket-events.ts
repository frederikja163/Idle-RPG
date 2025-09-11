import { type TLiteralValue, type TProperties, type TSchema, Type } from '@sinclair/typebox';
import { ErrorType } from './socket-errors';
import { createDtos, createManyDtos, createProfileDto, simplify } from './socket-event-helpers';
import { itemsTable } from '../definition/schema/db/db-items';
import { profilesTable } from '../definition/schema/db/db-profiles';
import { skillsTable } from '../definition/schema/db/db-skills';
import { usersTable } from '../definition/schema/db/db-users';
import { createSelectSchema } from 'drizzle-typebox';

export const activityDto = Type.Union([activity('none', {}), activity('crafting', { recipeId: Type.String() })]);
const activityReplaceDto = Type.Omit(activityDto, ['start']);

const usersSchema = createSelectSchema(usersTable);
const userDtos = createDtos(
  usersSchema,
  ['id', 'settings', 'email', 'profilePicture', 'firstLogin', 'lastLogin'],
  ['settings'],
);

const profileSchema = simplify(createSelectSchema(profilesTable));
const profileDtos = createDtos(
  Type.Composite([profileSchema, Type.Object({ activity: activityDto })]),
  ['id', 'settings', 'name', 'firstLogin', 'lastLogin', 'activity'],
  ['settings'],
);
const profileManyDtos = createManyDtos(profileDtos);

const itemSchema = createSelectSchema(itemsTable);
export const itemDtos = createDtos(itemSchema, ['id', 'index', 'count'], ['index']);
export const itemManyDtos = createManyDtos(itemDtos);

const skillSchema = createSelectSchema(skillsTable);
export const skillDtos = createDtos(skillSchema, ['id', 'xp', 'level'], []);
export const skillManyDtos = createManyDtos(skillDtos);

export const clientServerEvent = Type.Union([
  event('Connection/Ping', {}),
  event('User/GoogleLogin', { token: Type.String() }),
  event('User/Logout', {}),
  event('User/Query', { user: userDtos.query }),
  event('User/Update', { user: userDtos.update }),
  event('Profile/QueryMany', { profiles: profileManyDtos.query }),
  event('Profile/Query', createProfileDto(profileDtos.query, itemManyDtos.query, skillManyDtos.query)),
  event('Profile/Update', createProfileDto(profileDtos.update, itemManyDtos.update, skillManyDtos.update)),
  eventRaw('Profile/ActivityReplace', activityReplaceDto),
  event('Profile/Create', { name: Type.String() }),
  event('Profile/Select', { profileId: Type.String() }),
  event('Profile/Delete', { profileId: Type.String() }),
]);

export const serverClientEvent = Type.Union([
  event('Connection/Error', {
    errorType: Type.Enum(ErrorType),
    message: Type.Optional(Type.String()),
  }),
  event('Connection/Shutdown', {
    reason: Type.String(),
    time: Type.Date(),
  }),
  event('Connection/Pong', {}),
  event('User/LoggedIn', {}),
  event('User/LoggedOut', {}),
  event('User/Updated', { user: userDtos.result }),
  event('Profile/UpdatedMany', { profiles: profileManyDtos.result }),
  event('Profile/Updated', createProfileDto(profileDtos.result, itemManyDtos.result, skillManyDtos.result)),
]);

function eventRaw<T1 extends TLiteralValue, T2 extends TSchema>(type: T1, data: T2) {
  return Type.Object({ type: Type.Literal(type), messageCount: Type.Number(), data: data });
}

function event<T1 extends TLiteralValue, T2 extends TProperties>(type: T1, data: T2) {
  return Type.Object({ type: Type.Literal(type), messageCount: Type.Number(), data: Type.Object(data) });
}

function activity<T1 extends TLiteralValue, T2 extends TProperties>(type: T1, data: T2) {
  return Type.Object({ type: Type.Literal(type), start: Type.Date(), ...data });
}
