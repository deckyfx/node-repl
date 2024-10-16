import repl, { command } from "../dist/index";

async function add(...inputs: (string | number)[]) {
  return inputs.reduce((sum, cur) => {
    return sum + typeof cur === "number" ? cur : 0;
  }, 0);
}

command("add", async (args) => {
  const result = await add(...args.args);
  return true;
});

repl();
