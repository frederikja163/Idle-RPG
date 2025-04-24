export enum ErrorType {
  NotImplemented = "This is not implemented yet.",
  EmailNotVerified = "Email is not verified.",
  RequiresLogin = "You must login to do this.",
  ProfileInUse = "This profile is already in use, please make sure you log out on all devices before deleting a profile.",
  NameTaken = "A profile with this name already exists.",
  InvalidProfile = "The selected profile is invalid, please select a valid profile.",
}

export type ProfileDto = {
  name: string;
  mining: number;
  smithery: number;
  lumberjacking: number;
  carpentry: number;
  crafting: number;
};

export type ClientServerEvent = {
  // Pong
  Ping: {};
  // Authentication/LoginSuccess
  // Error: EmailNotVerified
  "Authentication/GoogleLogin": { token: string };
  // Authentication/LogoutSuccess
  "Authentication/Logout": {};
  // Profiles/UpdateProfiles
  // Error: RequiresLogin
  "Profiles/GetProfiles": {};
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, NameTaken
  "Profiles/CreateProfile": { name: string };
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, ProfileInUse, InvalidProfile
  "Profiles/DeleteProfile": { index: number };
  // Profiles/SelectProfileSuccess
  // Error: RequiresLogin, InvalidProfile
  "Profiles/SelectProfile": { index: number };
};

export type ServerClientEvent = {
  Pong: {};
  Error: { error: ErrorType };
  "Authentication/LoginSuccess": {};
  "Authentication/LogoutSuccess": {};
  "Profiles/UpdateProfiles": { profiles: ProfileDto[] };
  "Profiles/SelectProfileSuccess": {};
};
