import { Project, SourceFile } from "npm:ts-morph";
import { walkSync } from "https://deno.land/std@0.213.0/fs/mod.ts";

const start = Date.now();

const allBlocks: string[] = [];

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
  const config: Record<string, string | Record<string, unknown>[] | undefined> =
    {};

  const block = Deno.readTextFileSync(`/${path}/block.ts`);
  const tsBlock = sandbox.createSourceFile(`${path}/block.ts`, block);

  config.name = getVariable(tsBlock, "_name");
  config.icon = getVariable(tsBlock, "_icon");
  config.description = getVariable(tsBlock, "_description");

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

  const returnType = getReturnType(tsBlock) || "unknown";
  config.returnType = returnType;

  Deno.writeTextFileSync(`${path}/config.json`, JSON.stringify(config));

  console.log("\x1b[32m+\x1b[0m Built config for", config.name);
});

function GetUiOptions(file: SourceFile, param: string) {
  const value = file.getVariableDeclaration(`_param_${param}_ui`);

  if (!value) {
    return null;
  }

  return JSON.parse(value.getInitializer()?.getText() || "{}");
}

function getVariable(file: SourceFile, variable: string) {
  let value = file.getVariableDeclaration(variable)?.getInitializer()
    ?.getText();
  while (value?.includes('"')) {
    value = value.replace('"', "");
  }

  return value;
}

function getReturnType(file: SourceFile) {
  const funcs = file.getFunctions();
  const exports = funcs.filter((func) => func.isDefaultExport());

  if (exports.length < 1) {
    return null;
  }

  return exports[0].getReturnType().getText();
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
