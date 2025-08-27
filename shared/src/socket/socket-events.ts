import { Type, type TLiteralValue, type TProperties } from '@sinclair/typebox';
import { ErrorType } from './socket-errors';
import { createProfileDto, itemManyDtos, profileDtos, profileManyDtos, skillManyDtos, userDtos } from './socket-dtos';

export const clientServerEvent = Type.Union([
  event('Connection/Ping', {}),
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

function event<T1 extends TLiteralValue, T2 extends TProperties>(type: T1, data: T2) {
  return Type.Object({ type: Type.Literal(type), messageCount: Type.Number(), data: Type.Object(data) });
}
