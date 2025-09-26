export enum ErrorType {
  NotImplemented,
  InternalError,
  Desync,
  InvalidInput,
  EmailNotVerified,
  RequiresLogin,
  ProfileInUse,
  ProfileDoesNotExist,
  InsufficientPermissions,
  NameTaken,
  ArgumentOutOfRange,
  RequiresProfile,
  InsufficientLevel,
  InsufficientItems,
  NoActivity,
  InvalidActivity,
}

export const errorMessages: { [type in ErrorType]: string } = {
  [ErrorType.NotImplemented]: 'This is not implemented yet.',
  [ErrorType.InternalError]: 'The server experienced an internal error handling your request.',
  [ErrorType.Desync]: 'Server and client got out of sync.',
  [ErrorType.InvalidInput]: 'The input was invalid, so the action could not be performed.',
  [ErrorType.InsufficientPermissions]: 'You do not have permission to do this action.',
  [ErrorType.EmailNotVerified]: 'Email is not verified.',
  [ErrorType.RequiresLogin]: 'You must login to do this.',
  [ErrorType.ProfileInUse]:
    'This profile is already in use, please make sure you log out on all devices before deleting a profile.',
  [ErrorType.ProfileDoesNotExist]: 'No profile exists with provided id.',
  [ErrorType.NameTaken]: 'A profile with this name already exists.',
  [ErrorType.ArgumentOutOfRange]: 'Provided argument is out of range.',
  [ErrorType.RequiresProfile]: 'You must select a profile to do this.',
  [ErrorType.InsufficientLevel]: 'This activity requires a lever higher than yours.',
  [ErrorType.InsufficientItems]: 'This activity required more items than you have available.',
  [ErrorType.NoActivity]: 'No activity in progress.',
  [ErrorType.InvalidActivity]: 'Activity is invalid.',
};

export class ServerError extends Error {
  constructor(
    public readonly errorType: ErrorType,
    message?: string,
  ) {
    super(message);
  }
}
