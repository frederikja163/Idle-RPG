import { ErrorType } from '@/shared/socket-events';
import { ServerSocket, type ServerData } from '../server-socket';
import { Inventory } from '../db/inventory';

export function initProfileEvents(socket: ServerSocket) {
  socket.on('Profiles/GetProfiles', getProfiles);
  socket.on('Profiles/DeleteProfile', deleteProfile);
  socket.on('Profiles/CreateProfile', createProfile);
  socket.on('Profiles/SelectProfile', selectProfile);
}

async function getProfiles(socket: ServerSocket, {}: ServerData<'Profiles/GetProfiles'>) {
  const user = socket.user;
  if (!user) return socket.error(ErrorType.RequiresLogin);

  socket.send('Profiles/UpdateProfiles', {
    profiles: user.profiles.map((p) => p.getDto()),
  });
}

async function createProfile(socket: ServerSocket, { name }: ServerData<'Profiles/CreateProfile'>) {
  const user = socket.user;
  if (!user) return socket.error(ErrorType.RequiresLogin);
  const profile = await user.addProfile(name);
  if (!profile) return socket.error(ErrorType.NameTaken);

  user.send('Profiles/UpdateProfiles', {
    profiles: user.profiles.map((p) => p.getDto()),
  });
}

async function deleteProfile(socket: ServerSocket, { index }: ServerData<'Profiles/DeleteProfile'>) {
  const user = socket.user;
  if (!user) return socket.error(ErrorType.RequiresLogin);

  const profiles = user.profiles;
  if (index < 0 || index >= profiles.length) return socket.error(ErrorType.ArgumentOutOfRange);

  const profile = profiles[index];
  if (profile.hasSockets) return socket.error(ErrorType.ProfileInUse);

  await user.deleteProfile(index);
  user.send('Profiles/UpdateProfiles', {
    profiles: user.profiles.map((p) => p.getDto()),
  });
}

async function selectProfile(socket: ServerSocket, { index }: ServerData<'Profiles/SelectProfile'>) {
  const user = socket.user;
  if (!user) return socket.error(ErrorType.RequiresLogin);
  const profiles = user.profiles;
  if (index < 0 || index >= profiles.length) return socket.error(ErrorType.ArgumentOutOfRange);

  const profile = profiles[index];
  profile.addSocket(socket);
  socket.profile = profile;
  socket.inventory = await Inventory.createInventory(profile.id);
  socket.send('Profiles/SelectProfileSuccess', {});
}
