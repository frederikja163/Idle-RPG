export enum ErrorType {
  EmailNotVerified = "Email is not verified.",
}

export type ProfileDto = {
  mining: number;
  smithery: number;
  lumberjacking: number;
  carpentry: number;
  crafting: number;
};

export type ClientServerEvent = {
  Ping: {};
  "Authentication/GoogleLogin": { token: string };
  "Authentication/Logout": {};
};

export type ServerClientEvent = {
  Pong: {};
  Error: { error: ErrorType };
  "Authentication/LoginSuccess": { profiles: ProfileDto[] };
  "Authentication/LogoutSuccess": {};
};
