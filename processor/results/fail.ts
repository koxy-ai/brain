import { FailedReturn } from "../../types/block-return.ts";
import Koxy from "../main.ts";

export default async function processFailure(
  window: Koxy,
  res: FailedReturn,
  next: string | undefined,
) {
  if (next) {
    await window.controller(next);
    return;
  }

  window.throwError({ err: res.err || "Unexpected error" });

  window.stop();
  return;
}
