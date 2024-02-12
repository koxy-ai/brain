interface Operation {
  op: string;
  value?: "self" | unknown;
  mode?: "replace" | "add" | "subtract" | "concat" | "merge" | "filter" | "map";
}

interface Block {
  id: string;
  name: string;
  type: "block";
  position: {
    x: number,
    y: number
  };
  source: string;
  inputs: Record<string, {
    value: string;
    type: "string" | "number" | "boolean" | "object" | "array";
    operations?: Operation[];
  }>;
  next: {
    success?: string;
    failed?: string;
  };
}

export { type Operation };
export default Block;
