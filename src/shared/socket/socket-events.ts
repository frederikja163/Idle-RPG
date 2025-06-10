import {
  Record,
  Type,
  type TBoolean,
  type TLiteralValue,
  type TObject,
  type TOptional,
  type TProperties,
  type TSchema,
} from '@sinclair/typebox';
import { createSelectSchema } from 'drizzle-typebox';
import { profilesTable } from '../definition/schema/db/db-profiles';
import { itemsTable } from '../definition/schema/db/db-items';
import { skillsTable } from '../definition/schema/db/db-skills';
import { ErrorType } from './socket-errors';
import { usersTable } from '../definition/schema/db/db-users';

function createQuery<T extends TSchema>(schema: T) {
  const props: Record<string, TSchema> = {};

  for (const key in schema.properties) {
    props[key] = Type.Optional(Type.Boolean());
  }

  return Type.Object(props) as TObject<{ [k in keyof T['properties']]: TOptional<TBoolean> }>;
}

function createDtos<
  TObj extends TObject,
  TPropUpdate extends keyof TObj['properties'],
  TPropRemove extends keyof TObj['properties'],
>(schema: TObj, updateableKeys: readonly TPropUpdate[], removedKeys: readonly TPropRemove[]) {
  const type = Type.Partial(Type.Omit(schema, removedKeys));
  const query = createQuery(Type.Omit(type, ['id']));
  const update = Type.Pick(type, updateableKeys);
  const result = type;
  return { query, update, result };
}

function createMany<T extends TSchema>(schema: T) {
  return Type.Composite([Type.Object({ id: Type.Union([Type.Boolean(), Type.Array(Type.String())]) }), schema]);
}

function createManyDtos<TQuery extends TSchema, TUpdate extends TSchema, TResult extends TSchema>(dtos: {
  query: TQuery;
  update: TUpdate;
  result: TResult;
}) {
  const query = createMany(dtos.query);
  const update = createMany(dtos.update);
  const result = Type.Array(dtos.result);
  return { result, query, update };
}

function createProfileDto<TProfile extends TSchema, TItem extends TSchema, TSkill extends TSchema>(
  profileDto: TProfile,
  itemDto: TItem,
  skillDto: TSkill,
) {
  return { profile: Type.Optional(profileDto), items: Type.Optional(itemDto), skills: Type.Optional(skillDto) };
}

const usersSchema = createSelectSchema(usersTable);
const userDtos = createDtos(usersSchema, ['settings'], ['googleId']);

const profileSchema = createSelectSchema(profilesTable);
const profileDtos = createDtos(profileSchema, ['settings'], []);
const profileManyDtos = createManyDtos(profileDtos);

const itemSchema = createSelectSchema(itemsTable);
const itemDtos = createDtos(itemSchema, ['index'], ['profileId']);
const itemManyDtos = createManyDtos(itemDtos);

const skillSchema = createSelectSchema(skillsTable);
const skillDtos = createDtos(skillSchema, [], ['profileId']);
const skillManyDtos = createManyDtos(skillDtos);

export const clientServerEvent = Type.Union([
  event('User/GoogleLogin', { token: Type.String() }),
  event('User/Logout', {}),
  event('User/Query', { user: userDtos.query }),
  event('User/Update', { user: userDtos.update }),
  event('Profile/QueryMany', { profiles: profileManyDtos.query }),
  event('Profile/Query', createProfileDto(profileDtos.query, itemManyDtos.query, skillManyDtos.query)),
  event('Profile/Update', createProfileDto(profileDtos.update, itemManyDtos.update, skillManyDtos.update)),
  event('Profile/ActivityReplace', { activityId: Type.String() }),
  event('Profile/Create', { name: Type.String() }),
  event('Profile/Select', { profileId: Type.String() }),
  event('Profile/Delete', { profileId: Type.String() }),
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
  event('User/LoggedIn', {}),
  event('User/LoggedOut', {}),
  event('User/Updated', { user: userDtos.result }),
  event('Profile/UpdatedMany', { profiles: profileManyDtos.result }),
  event('Profile/Updated', createProfileDto(profileDtos.result, itemManyDtos.result, skillManyDtos.result)),
]);

function event<T1 extends TLiteralValue, T2 extends TProperties>(type: T1, data: T2) {
  return Type.Object({ type: Type.Literal(type), data: Type.Object(data) });
}
