import { SuccessReturn } from "../../types/block-return.ts";
import Koxy from "../main.ts";

export default async function processSuccess(
  window: Koxy,
  res: SuccessReturn,
  next: string | undefined,
) {
  if (res.result) {
    window.results.set(window.position, res);
  }

  if (next) {
    await window.controller(next);
    return;
  }

  window.stop();
  return;
}
