import { Record, Type, type TBoolean, type TObject, type TOptional, type TSchema } from '@sinclair/typebox';

export function simplify<T extends TObject>(schema: T) {
  const props: Record<string, TSchema> = {};

  for (const key in schema.properties) {
    props[key] = schema.properties[key];
  }

  return Type.Object(props) as TObject<{ [k in keyof T['properties']]: T['properties'][k] }>;
}

export function createQuery<T extends TSchema>(schema: T) {
  const props: Record<string, TSchema> = {};

  for (const key in schema.properties) {
    props[key] = Type.Optional(Type.Boolean());
  }

  return Type.Object(props) as TObject<{ [k in keyof T['properties']]: TOptional<TBoolean> }>;
}

export function createDtos<
  TObj extends TObject,
  TPropQuery extends keyof TObj['properties'],
  TPropUpdate extends keyof TObj['properties'],
>(schema: TObj, queryableKeys: readonly TPropQuery[], updateableKeys: readonly TPropUpdate[]) {
  const type = Type.Partial(Type.Pick(schema, queryableKeys));
  const query = createQuery(Type.Omit(type, ['id']));
  const update = Type.Intersect([Type.Partial(Type.Pick(schema, updateableKeys)), Type.Pick(schema, ['id'])]);
  const result = type;
  return { query, update, result };
}

export function createMany<T extends TSchema>(schema: T) {
  return Type.Composite([Type.Object({ id: Type.Union([Type.Boolean(), Type.Array(Type.String())]) }), schema]);
}

export function createManyDtos<TQuery extends TSchema, TUpdate extends TSchema, TResult extends TSchema>(dtos: {
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
  return {
    profile: Type.Optional(profileDto),
    items: Type.Optional(itemDto),
    skills: Type.Optional(skillDto),
  };
}
