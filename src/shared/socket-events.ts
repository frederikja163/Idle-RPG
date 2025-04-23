export type ClientServerEvent = {
  Ping: {};
  "Authentication/GoogleLogin": { token: string };
  "Authentication/Logout": {};
};

export enum ErrorType {
  EmailNotVerified = "Email is not verified.",
}

export type ServerClientEvent = {
  Pong: {};
  Error: { error: ErrorType };
  "Authentication/LoginSuccess": {};
  "Authentication/LogoutSuccess": {};
};
