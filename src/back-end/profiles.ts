import type { InferSelectModel } from "drizzle-orm";
import { database, type UserId } from "./database";
import { profileTable } from "./db/schema";
import {
  ErrorType,
  type ClientServerEvent,
  type ProfileDto,
} from "@/shared/socket-events";
import { ServerSocket } from "./server-socket";
import type { DataType } from "@/shared/socket";

export function initProfileEvents(socket: ServerSocket) {
  socket.on("Profiles/GetProfiles", getProfiles);
  socket.on("Profiles/DeleteProfile", deleteProfile);
  socket.on("Profiles/CreateProfile", createProfile);
  socket.on("Profiles/SelectProfile", selectProfile);
}

async function getProfiles(
  socket: ServerSocket,
  data: DataType<ClientServerEvent, "Profiles/GetProfiles">
) {
  if (!socket.user) {
    socket.error(ErrorType.RequiresLogin);
    return;
  }

  const profiles = await database.getProfiles(socket.user.id);
  socket.send("Profiles/UpdateProfiles", {
    profiles: profiles.map(getProfileDto),
  });
}

async function createProfile(
  socket: ServerSocket,
  { name }: ClientServerEvent["Profiles/CreateProfile"]
) {
  if (!socket.user) return socket.error(ErrorType.RequiresLogin);

  const profile = await database.createProfile(socket.user.id, name);
  if (!profile) return socket.error(ErrorType.NameTaken);

  const profiles = await database.getProfiles(socket.user.id);
  ServerSocket.sendUser(socket.user.id, "Profiles/UpdateProfiles", {
    profiles: profiles.map(getProfileDto),
  });
}

async function deleteProfile(
  socket: ServerSocket,
  { index }: ClientServerEvent["Profiles/DeleteProfile"]
) {
  if (!socket.user) return socket.error(ErrorType.RequiresLogin);
  const profiles = await database.getProfiles(socket.user.id);
  if (index < 0 || index >= profiles.length)
    return socket.error(ErrorType.InvalidProfile);

  const profile = profiles[index];
  if (ServerSocket.getProfileSockets(profile.id)?.size ?? 0 != 0)
    return socket.error(ErrorType.ProfileInUse);

  database.deleteProfile(profiles[index].id);
  profiles.splice(index);
  ServerSocket.sendUser(socket.user.id, "Profiles/UpdateProfiles", {
    profiles: profiles.map(getProfileDto),
  });
}

async function selectProfile(
  socket: ServerSocket,
  { index }: ClientServerEvent["Profiles/SelectProfile"]
) {
  if (!socket.user) return socket.error(ErrorType.RequiresLogin);

  const profiles = await database.getProfiles(socket.user.id);

  if (index < 0 || index >= profiles.length)
    return socket.error(ErrorType.InvalidProfile);

  socket.profile = profiles[index];
  socket.send("Profiles/SelectProfileSuccess", {});
}

function getProfileDto(
  profile: InferSelectModel<typeof profileTable>
): ProfileDto {
  return {
    name: profile.name,
    mining: profile.mining,
    smithery: profile.smithery,
    lumberjacking: profile.lumberjacking,
    carpentry: profile.carpentry,
    crafting: profile.crafting,
  };
}
