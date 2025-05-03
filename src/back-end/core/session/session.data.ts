import type { ItemType, ProfileType, UserType } from '@/back-end/core/db/db.types';

export class SessionData {
  public user?: UserType;
  public profile?: ProfileType;

  constructor(public readonly id: string) {}

  public resetUser() {
    this.user = undefined;
  }

  public resetProfile() {
    this.profile = undefined;
  }
}
