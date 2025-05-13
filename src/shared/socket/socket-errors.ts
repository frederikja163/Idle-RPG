export enum ErrorType {
  NotImplemented,
  InternalError,
  InvalidInput,
  EmailNotVerified,
  RequiresLogin,
  ProfileInUse,
  NameTaken,
  ArgumentOutOfRange,
  RequiresProfile,
  InsufficientLevel,
  NoActivity,
}

export const errorMessages: { [type in ErrorType]: string } = {
  [ErrorType.NotImplemented]: "This is not implemented yet.",
  [ErrorType.InternalError]:
    "The server experienced an internal error handling your request.",
  [ErrorType.InvalidInput]:
    "The input was invalid, so the action could not be performed.",
  [ErrorType.EmailNotVerified]: "Email is not verified.",
  [ErrorType.RequiresLogin]: "You must login to do this.",
  [ErrorType.ProfileInUse]:
    "This profile is already in use, please make sure you log out on all devices before deleting a profile.",
  [ErrorType.NameTaken]: "A profile with this name already exists.",
  [ErrorType.ArgumentOutOfRange]: "Provided argument is out of range.",
  [ErrorType.RequiresProfile]: "You must select a profile to do this.",
  [ErrorType.InsufficientLevel]:
    "This activity requires a lever higher than yours.",
  [ErrorType.NoActivity]: "No activity in progress.",
};

export class ServerError extends Error {
  constructor(public readonly errorType: ErrorType, message?: string) {
    super(message);
  }
}
