import Types from "../../types/types.ts";
import { SuccessReturn } from "../../types/block-return.ts";
import Koxy from "../main.ts";

export default async function processSuccess(
  window: Koxy,
  res: SuccessReturn,
  next: string | undefined,
) {
  if (res.result) {
    window.results.set(window.position, {
      success: true,
      value: res.result,
      type: res.type || typeof res.result as Types,
    });
  }

  if (next) {
    await window.controller(next);
    return;
  }

  window.stop();
  return;
}
