import {
  Type,
  type Static,
  type TLiteralValue,
  type TProperties,
} from "@sinclair/typebox";

function event<T1 extends TLiteralValue, T2 extends TProperties>(
  type: T1,
  data: T2
) {
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
  InvalidProfile, // = "The selected profile is invalid, please select a valid profile.",
}

export const profileDto = Type.Object({
  name: Type.String(),
  mining: Type.Number(),
  smithery: Type.Number(),
  lumberjacking: Type.Number(),
  carpentry: Type.Number(),
  crafting: Type.Number(),
});
export type ProfileDto = Static<typeof profileDto>;

export const clientServerEvent = Type.Union([
  // Pong
  Type.Object({ type: Type.Literal("Ping"), data: Type.Object({}) }),
  // Authentication/LoginSuccess
  // Error: EmailNotVerified
  Type.Object({
    type: Type.Literal("Authentication/GoogleLogin"),
    data: Type.Object({ token: Type.String() }),
  }),
  // Authentication/LogoutSuccess
  Type.Object({
    type: Type.Literal("Authentication/Logout"),
    data: Type.Object({}),
  }),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin
  Type.Object({
    type: Type.Literal("Profiles/GetProfiles"),
    data: Type.Object({}),
  }),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, NameTaken
  Type.Object({
    type: Type.Literal("Profiles/CreateProfile"),
    data: Type.Object({ name: Type.String() }),
  }),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, ProfileInUse, InvalidProfile
  Type.Object({
    type: Type.Literal("Profiles/DeleteProfile"),
    data: Type.Object({ index: Type.Number() }),
  }),
  // Profiles/SelectProfileSuccess
  // Error: RequiresLogin, InvalidProfile
  Type.Object({
    type: Type.Literal("Profiles/SelectProfile"),
    data: Type.Object({ index: Type.Number() }),
  }),
]);
export type ClientServerEvent = typeof clientServerEvent;

export const serverClientEvent = Type.Union([
  event("Pong", {}),
  event("Error", { error: Type.Enum(ErrorType) }),
  event("Authentication/LoginSuccess", {}),
  event("Authentication/LogoutSuccess", {}),
  event("Profiles/UpdateProfiles", { profiles: Type.Array(profileDto) }),
  event("Profiles/SelectProfileSuccess", {}),
]);
export type ServerClientEvent = typeof serverClientEvent;
