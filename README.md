# Node-REPL

## What is this?

This is a simple nodejs server, it has zero dependancy!

## Features

- [x] zero dependancy
- [x] basic command handler
- [x] basic arguments handler

## Requirement

- nvm
- nodejs >= v20.17.0
- yarn

## Latest Version

1.0.a

## Usage

Install with

`npm i @decky.fx/node-repl`

See example folder

```typescript
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


```

### Todos
- [ ] Next ideas