import { Project, SourceFile } from "npm:ts-morph";
import { walkSync } from "https://deno.land/std@0.213.0/fs/mod.ts";

type Config = Record<
  string,
  string | Record<string, unknown>[] | undefined | boolean
>;

const start = Date.now();
const allBlocks: string[] = [];
const globalConf: Config[] = [];
const blocksCode: Record<string, string> = {};

const categories = [
  "general",
];

const sandbox = new Project({
  useInMemoryFileSystem: true,
});

console.log("---\nStarted builder...");

categories.map((category) => {
  const blocks = getAllBlocks(import.meta.dirname + `/${category}`);
  allBlocks.push(...blocks);
});

function getAllBlocks(directoryPath: string): string[] {
  const blocks: string[] = [];

  for (const entry of walkSync(directoryPath, { includeFiles: false })) {
    if (entry.isDirectory && entry.path !== directoryPath) {
      blocks.push(entry.path);
    }
  }

  return blocks;
}

allBlocks.map((path) => {
  const config: Record<
    string,
    string | Record<string, unknown>[] | undefined | boolean
  > = {};

  const block = Deno.readTextFileSync(`/${path}/block.ts`);
  const shortPath = path.substring(
    (import.meta.dirname?.length || 0) + 1,
    path.length,
  );
  blocksCode[shortPath] = block;
  const tsBlock = sandbox.createSourceFile(`${path}/block.ts`, block);

  config.name = getVariable(tsBlock, "_name");
  config.icon = getVariable(tsBlock, "_icon");
  config.description = getVariable(tsBlock, "_description");
  config.hasResult = getVariable(tsBlock, "_hasResult") ? true : false;
  (config.hasResult) ? config.result = getVariable(tsBlock, "_result") : null;

  const pathSplitted = path.split("/");
  const pathSplittedLength = pathSplitted.length;
  const category = pathSplitted[pathSplittedLength - 2];
  const method = pathSplitted[pathSplittedLength - 1];
  config.source = category + "/" + method;

  const params = getParams(tsBlock);
  params.forEach((param) => {
    const uiOptions = GetUiOptions(tsBlock, param.name);
    if (uiOptions) {
      params[params.indexOf(param)].ui = uiOptions;
    }
  });

  config.params = params;

  globalConf.push(config);
  Deno.writeTextFileSync(`${path}/config.json`, JSON.stringify(config));

  console.log("\x1b[32m+\x1b[0m Built config for", config.name);
});

console.log("\n\x1b[32m+\x1b[0m Writing global config...");
Deno.writeTextFileSync(
  import.meta.dirname + "/config.json",
  JSON.stringify(globalConf),
);

console.log("\x1b[32m+\x1b[0m Writing global blocks index...");
Deno.writeTextFileSync(
  import.meta.dirname + "/blocks.json",
  JSON.stringify(blocksCode),
);

function GetUiOptions(file: SourceFile, param: string) {
  const ui = file.getVariableDeclaration(`_param_${param}_ui`);

  if (!ui) {
    return null;
  }

  let value = ui.getInitializer()?.getText();

  if (!value) {
    return null;
  }

  // remove all new lines and replace { and }
  const parsed = value.replace(/\n/g, "").replace(/[{]/g, "").replace(
    /[}]/g,
    "",
  );

  if (parsed.endsWith(",")) {
    value = parsed.slice(0, -1);
  }

  return JSON.parse(`{${value}}` || "{}");
}

function getVariable(file: SourceFile, variable: string) {
  let value = file.getVariableDeclaration(variable)?.getInitializer()
    ?.getText();
  if (!value) {
    return undefined;
  }
  while (variable !== "_result" && value?.includes('"')) {
    value = value.replace('"', "");
  }

  return value;
}

function getParams(file: SourceFile) {
  const res: { name: string; type: unknown; ui?: unknown }[] = [];

  const paramsType = file.getTypeAlias("Params");
  if (!paramsType) {
    return res;
  }

  const paramsTypeNode = paramsType.getType();
  if (!paramsTypeNode) {
    return res;
  }

  const properties = paramsTypeNode.getProperties();

  properties.forEach((property) => {
    const name = property.getName();
    const type = property.getValueDeclaration()?.getType()?.getText();
    if (!name || !type) {
      return;
    }
    res.push({ name, type });
  });

  return res;
}

console.log("\n---\nDone in:", Date.now() - start, "ms");
