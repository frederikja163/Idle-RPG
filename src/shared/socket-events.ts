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
  event("Ping", {}),
  // Authentication/LoginSuccess
  // Error: EmailNotVerified
  event("Authentication/GoogleLogin", { token: Type.String() }),
  // Authentication/LogoutSuccess
  event("Authentication/Logout", {}),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin
  event("Profiles/GetProfiles", {}),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, NameTaken
  event("Profiles/CreateProfile", { name: Type.String() }),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, ProfileInUse, InvalidProfile
  event("Profiles/DeleteProfile", { index: Type.Number() }),
  // Profiles/SelectProfileSuccess
  // Error: RequiresLogin, InvalidProfile
  event("Profiles/SelectProfile", { index: Type.Number() }),
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
