import Types from "./types.ts";

export interface SuccessReturn {
  success: true;
  result?: unknown;
  type?: Types;
}

export interface FailedReturn {
  success: false;
  err?: string;
}

type BlockReturn = SuccessReturn | FailedReturn;

export default BlockReturn;
