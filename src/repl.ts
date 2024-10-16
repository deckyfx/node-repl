import { createInterface } from "node:readline";

import { AsyncLocalStorage } from "node:async_hooks";

export type CommandArg = {
  flags: {
    [key: string]: boolean | number | string;
  };
  args: (string | number)[];
};

export type CommandHandler = (
  args: CommandArg
) => Promise<boolean | undefined | null | void>;

export type Command = {
  command: string;
  handler: CommandHandler;
};

const commands: Command[] = [];

const storage = new AsyncLocalStorage();

let idSeq = 0;

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${milliseconds}`;
}

function logWithId(...msg: any[]) {
  const id = storage.getStore();
  console.log(
    `[COMMAND] [${formatDate(new Date())}] [${id !== undefined ? id : "-"}]:`,
    ...msg
  );
}

export function command(command: string, handler: CommandHandler) {
  commands.push({ command, handler });
}

function parseArg(input: string) {
  const arg = input.replace(/^['"]|['"]$/g, ""); // Remove quotes
  const parsedValue = parseFloat(arg);
  if (!isNaN(parsedValue)) {
    return parsedValue;
  } else {
    return arg;
  }
}

function parseArgs(input: string): {
  flags: { [key: string]: boolean | number | string };
  args: (string | number)[];
} {
  const flags: { [key: string]: boolean | number | string } = {};
  const args: (string | number)[] = [];

  const tokens = input.match(/(\-{1,2}[^\=]+\=)?"[^"]*"|'[^']*'|\S+/g) || [];

  for (const token of tokens) {
    if (token.startsWith("--")) {
      const [key, value] = token.slice(2).split("=");
      flags[key] = value ? parseArg(value) : true;
    } else if (token.startsWith("-")) {
      const [key, value] = token.slice(1).split("=");
      flags[key] = value ? parseArg(value) : true;
    } else {
      args.push(parseArg(token));
    }
  }

  return { flags, args };
}

export default async function repl() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Press Ctrl+C to exit.");

  rl.on("line", (line) => {
    const [command, ...raw_args] = line.split(/\s/gi);
    const args = parseArgs(raw_args.join(" "));
    const match = commands.find((needle) => {
      if (needle.command === command) {
        return true;
      }
      return false;
    });

    if (!match) {
      console.log(`Command "${line}" unhandled`);
      return;
    }

    if (match) {
      storage.run(idSeq++, () => {
        logWithId(`Handling: "${line}"`);
        setImmediate(async () => {
          try {
            await match.handler(args);
          } catch (error: any) {
            console.error(error);
          }
          logWithId("Done");
        });
      });
    }
  });

  rl.on("SIGINT", () => {
    console.log("\nExiting...");
    process.exit(0);
  });
}
