import { Record, Type, type TBoolean, type TObject, type TOptional, type TSchema } from '@sinclair/typebox';
import { createSelectSchema } from 'drizzle-typebox';
import { profilesTable } from '../definition/schema/db/db-profiles';
import { itemsTable } from '../definition/schema/db/db-items';
import { skillsTable } from '../definition/schema/db/db-skills';
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
  TPropQuery extends keyof TObj['properties'],
  TPropUpdate extends keyof TObj['properties'],
>(schema: TObj, updateableKeys: readonly TPropUpdate[], queryableKeys: readonly TPropQuery[]) {
  const type = Type.Pick(schema, queryableKeys);
  const query = createQuery(Type.Omit(type, ['id']));
  const update = Type.Pick(schema, updateableKeys);
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

export function createProfileDto<TProfile extends TSchema, TItem extends TSchema, TSkill extends TSchema>(
  profileDto: TProfile,
  itemDto: TItem,
  skillDto: TSkill,
) {
  return { profile: Type.Optional(profileDto), items: Type.Optional(itemDto), skills: Type.Optional(skillDto) };
}

const usersSchema = createSelectSchema(usersTable);
export const userDtos = createDtos(
  usersSchema,
  ['settings', 'email', 'profilePicture', 'firstLogin', 'lastLogin'],
  ['settings'],
);

const profileSchema = createSelectSchema(profilesTable);
export const profileDtos = createDtos(
  profileSchema,
  ['settings', 'name', 'firstLogin', 'lastLogin', 'activityId', 'activityStart'],
  ['settings'],
);
export const profileManyDtos = createManyDtos(profileDtos);

const itemSchema = createSelectSchema(itemsTable);
export const itemDtos = createDtos(itemSchema, ['index', 'count'], ['index']);
export const itemManyDtos = createManyDtos(itemDtos);

const skillSchema = createSelectSchema(skillsTable);
export const skillDtos = createDtos(skillSchema, ['xp', 'level'], []);
export const skillManyDtos = createManyDtos(skillDtos);
