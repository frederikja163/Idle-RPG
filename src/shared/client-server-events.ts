export type ClientServerEvent = {
  Ping: {};
  "Account/Authenticate": { token: string };
};
