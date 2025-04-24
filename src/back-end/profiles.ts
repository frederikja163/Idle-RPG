import type { InferSelectModel } from "drizzle-orm";
import { database, type UserId } from "./database";
import { profileTable } from "./db/schema";
import type { ProfileDto } from "@/shared/socket-events";
import type { ServerSocket } from "./server-socket";

export function initProfileEvents(socket: ServerSocket) {}

export async function getProfileDtos(userId: UserId) {
  const profiles = await database.getProfiles(userId);
  return profiles.map(getProfileDto);
}

export function getProfileDto(
  profile: InferSelectModel<typeof profileTable>
): ProfileDto {
  return {
    mining: profile.mining,
    smithery: profile.smithery,
    lumberjacking: profile.lumberjacking,
    carpentry: profile.carpentry,
    crafting: profile.crafting,
  };
}
