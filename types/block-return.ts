export interface SuccessReturn {
  success: true;
  result?: unknown;
}

export interface FailedReturn {
  success: false;
  err?: string;
}

type BlockReturn = SuccessReturn | FailedReturn;

export default BlockReturn;
