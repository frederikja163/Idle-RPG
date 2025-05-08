import {
  SocketOpenEventToken,
  type SocketOpenEventData,
  type SocketOpenEventListener,
} from '@/back-end/core/events/socket-event';
import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { SkillService } from './skill-service';
import { SocketHub } from '@/back-end/core/server/sockets/socket-hub';
import type { ServerData } from '@/back-end/core/server/sockets/socket-types';
import type { ServerSocket } from '@/back-end/core/server/sockets/server-socket';
import { ErrorType } from '@/shared/socket/socket.events';

@injectableSingleton(SocketOpenEventToken)
export class SkillController implements SocketOpenEventListener {
  public constructor(private readonly socketHub: SocketHub, private readonly skillService: SkillService) {}

  public onSocketOpen({ socketId }: SocketOpenEventData): void | Promise<void> {
    const socket = this.socketHub.getSocket(socketId);
    socket?.on('Skill/GetSkills', this.handleGetSkills.bind(this));
  }

  public async handleGetSkills(socket: ServerSocket, {}: ServerData<'Skill/GetSkills'>) {
    const profileId = this.socketHub.getProfileId(socket.id);
    if (!profileId) return socket.error(ErrorType.RequiresProfile);

    const skills = await this.skillService.getSkillsByProfileId(profileId);
    if (!skills) return socket.error(ErrorType.InternalError);

    socket.send('Skill/UpdateSkills', { skills });
  }
}
