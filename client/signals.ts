import type { Effect } from "../definitions.d.ts";

let runningEffect: Effect | undefined;

const SIGNAL = Symbol();

export const isSignal = (
  value: unknown,
): value is ReturnType<typeof createSignal> => {
  if (value !== null && typeof value === "object" && SIGNAL in value) {
    return true;
  }
  return false;
};

export const createSignal = <T>(initialValue: T) => {
  let value = initialValue;
  const subscribers = new Set<Effect>();

  return {
    [SIGNAL]: true,
    get value() {
      if (runningEffect) {
        subscribers.add(runningEffect);
      }
      return value;
    },
    set value(newValue) {
      value = newValue;
      for (const subscriber of subscribers) {
        subscriber();
      }
    },
  };
};

export const createEffect = (fn: Effect) => {
  function compute() {
    let prev;
    try {
      prev = runningEffect;
      runningEffect = compute;
      fn();
    } finally {
      runningEffect = prev;
    }
  }
  compute();
};
