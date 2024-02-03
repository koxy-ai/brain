interface Block {
  type: "block";
  source: string;
  inputs: Record<string, Record<string, unknown>>;
  next: {
    success?: string;
    failed?: string;
  };
}

export default Block;
