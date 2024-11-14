import repl, { command } from "../src/index";

async function add(...inputs: (string | number)[]) {
  return inputs.reduce<number>((sum, cur) => {
    const _cur = typeof cur === "number" ? cur : 0;
    return sum + _cur;
  }, 0);
}

command("add", async (args) => {
  const result = await add(...args.args);
  console.log("Result", result);
  return true;
});

repl({
  prompt: "hello> ",
});
