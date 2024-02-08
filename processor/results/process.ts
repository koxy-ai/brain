import BlockReturn from "../../types/block-return.ts";
import Koxy from "../main.ts";

export default async function processResult(window: Koxy, res: BlockReturn) {
  const next = window.next;

  if (!res) {
    return window.throwError({ err: "source return is invalid", stop: true });
  }

  if (next?.success === window.position || next?.failed === window.position) {
    return window.throwError({
      err: "Loop detected: A block can't point to itself",
      stop: true,
    });
  }

  if (res.success === false) {
    await window.processFailure(window, res, next?.failed);
    return;
  }

  await window.processSuccess(window, res, next?.success);
}
