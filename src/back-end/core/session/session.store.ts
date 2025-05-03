import { injectable, singleton } from 'tsyringe';
import { SessionData } from './session.data';

@injectable()
@singleton()
export class SessionStore {
  private readonly store = new Map<string, SessionData>();

  public get(id: string): SessionData {
    const cached = this.store.get(id);
    if (cached) return cached;

    const data = new SessionData(id);
    this.store.set(id, data);
    return data;
  }

  public close(id: string) {
    this.store.delete(id);
  }
}
