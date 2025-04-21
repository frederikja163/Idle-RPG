const commands: Map<
  string,
  { name: string; description: string; command: (args: string[]) => void }
> = new Map();

async function startCli() {
  const stdin = Bun.stdin.stream();
  if (stdin.locked) {
    return;
  }
  while (true) {
    for await (const input of console) {
      runCommand(input);
    }
  }
}
startCli();

function runCommand(input: string) {
  const commandInfo = parseCommand(input);
  if (!commandInfo) {
    console.log("Command not found, try 'help'");
    return;
  }
  const { command, args } = commandInfo;
  try {
    command.command(args);
  } catch (err) {
    console.error(err);
  }
}

function parseCommand(input: string) {
  const args = input.split(" ");
  if (args.length == 0) {
    return null;
  }
  const commandStr = args[0];
  const command = commands.get(commandStr);
  if (!command) {
    return null;
  }
  return { command, args };
}

export function addCommand(
  name: string,
  description: string,
  command: (args: string[]) => void
) {
  commands.set(name, { name, description, command });
}

addCommand("help", "Displays a list of all commands", (args) => {
  commands.forEach((command) => {
    console.log(`${command.name}\t${command.description}`);
  });
});
