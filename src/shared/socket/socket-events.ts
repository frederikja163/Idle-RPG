import { Type, type TLiteralValue, type TProperties } from "@sinclair/typebox";
import { createSelectSchema } from "drizzle-typebox";
import { profilesTable } from "../definition/schema/db/db-profiles";
import { itemsTable } from "../definition/schema/db/db-items";
import { skillsTable } from "../definition/schema/db/db-skills";

export enum ErrorType {
  NotImplemented, // = "This is not implemented yet.",
  InternalError, // = "The server experienced an internal error handling your request, try again.",
  InvalidInput, // = "The input was invalid, so the action could not be performed.",
  EmailNotVerified, // = "Email is not verified.",
  RequiresLogin, // = "You must login to do this.",
  ProfileInUse, // = "This profile is already in use, please make sure you log out on all devices before deleting a profile.",
  NameTaken, // = "A profile with this name already exists.",
  ArgumentOutOfRange, // = "Provided argument is out of range.",
  RequiresProfile, // = "You must select a profile to do this.",
  InsufficientLevel, // = "This activity requires a lever higher than yours.",
  NoActivity, // = "No activity in progress.",
}

const profileDto = createSelectSchema(profilesTable);
const itemDto = createSelectSchema(itemsTable);
const skillDto = createSelectSchema(skillsTable);

export const clientServerEvent = Type.Union([
  // Auth/LoginSuccess
  // Error: EmailNotVerified
  event("Auth/GoogleLogin", { token: Type.String() }),
  // Auth/LogoutSuccess
  // Error: RequiresLogin
  event("Auth/Logout", {}),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin
  event("Profile/GetProfiles", {}),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, NameTaken
  event("Profile/CreateProfile", { name: Type.String() }),
  // Profiles/SelectProfileSuccess
  // Error: RequiresLogin, ArgumentOutOfRange
  event("Profile/SelectProfile", { index: Type.Number() }),
  // Profiles/UpdateProfiles
  // Error: RequiresLogin, ProfileInUse, ArgumentOutOfRange
  event("Profile/DeleteProfile", { index: Type.Number() }),
  // Inventory/UpdateInventory
  // Error: RequiresProfile
  event("Inventory/GetInventory", {}),
  // Inventory/UpdateInventory
  // Error: RequiresProfile, ArgumentOutOfRange
  event("Inventory/SwapItems", {
    index1: Type.Number(),
    index2: Type.Number(),
  }),
  // Skill/UpdateSkills
  // Error: RequiresProfile
  event("Skill/GetSkills", {}),
  // Activity/ActivityStarted
  // Error: RequiresProfile, InsufficientLevel
  event("Activity/StartActivity", { activityId: Type.String() }),
  // Activity/ActivityStopped
  // Error: RequiresProfile, NoActivity
  event("Activity/StopActivity", {}),
  // Activity/ActivityStarted
  // Error: RequiresProfile, NoActivity
  event("Activity/GetActivity", {}),
]);

export const serverClientEvent = Type.Union([
  event("Error", { error: Type.Enum(ErrorType) }),
  event("Auth/LoginSuccess", {}),
  event("Auth/LogoutSuccess", {}),
  event("Profile/UpdateProfiles", { profiles: Type.Array(profileDto) }),
  event("Profile/SelectProfileSuccess", {}),
  event("Inventory/UpdateInventory", { items: Type.Array(itemDto) }),
  event("Skill/UpdateSkills", { skills: Type.Array(skillDto) }),
  event("Activity/ActivityStarted", {
    activityId: Type.String(),
    activityStart: Type.Date(),
  }),
  event("Activity/ActivityStopped", {
    activityId: Type.String(),
    activityStop: Type.Date(),
  }),
]);

function event<T1 extends TLiteralValue, T2 extends TProperties>(
  type: T1,
  data: T2
) {
  return Type.Object({ type: Type.Literal(type), data: Type.Object(data) });
}
