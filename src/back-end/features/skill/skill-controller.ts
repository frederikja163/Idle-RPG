import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from "@/back-end/core/events/socket-event";
import { injectableSingleton } from "@/back-end/core/lib/lib-tsyringe";
import { SkillService } from "./skill-service";
import { SocketHub } from "@/back-end/core/server/sockets/socket-hub";
import type { ServerSocket } from "@/back-end/core/server/sockets/server-socket";
import type { ServerData } from "@/shared/socket/socket-types";
import type { Skill } from "@/shared/definition/schema/types/types-skills";

@injectableSingleton(SocketOpenEventToken)
export class SkillController implements SocketOpenEventListener {
  public constructor(
    private readonly socketHub: SocketHub,
    private readonly skillService: SkillService
  ) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId);
    socket?.on("Skill/GetSkills", this.handleGetSkills.bind(this));
  }

  public async handleGetSkills(
    socket: ServerSocket,
    {skillIds}: ServerData<"Skill/GetSkills">
  ) {
    const profileId = this.socketHub.requireProfileId(socket.id);
    if (skillIds){
      const skills: Skill[] = [];
      for (const skillId of skillIds) {
        const skill = await this.skillService.getSkillById(profileId, skillId);
        skills.push(skill);
      }
      return skills;
    }
    const skills = await this.skillService.getSkillsByProfileId(profileId);
    socket.send("Skill/UpdateSkills", { skills });
  }
}
