import { appIds } from "../app/uklad/catalog.js";
import type { AppRuntime } from "../app/uklad/runtime.js";

/** One cancellable wall-clock deadline per runtime, including after host suspension. */
export function createExamDeadlineTimer(runtime: Pick<AppRuntime, "dispatch">) {
  let deadline: number | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function reconcile() {
    clearTimeout(timer);
    timer = undefined;
    if (deadline === null) return;
    const remaining = deadline - Date.now();
    if (remaining > 0) {
      timer = setTimeout(reconcile, remaining);
    } else {
      runtime.dispatch([
        appIds.events.testSessionFinished,
        "time-expired",
        deadline,
      ]);
      deadline = null;
    }
  }

  function setDeadline(value: number | null) {
    deadline = value;
    reconcile();
  }

  return { setDeadline, reconcile };
}
