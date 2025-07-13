export type Effect = () => void;

let runningEffect: Effect | undefined;

export const createSignal = <T>(initialValue: T) => {
  let value = initialValue;
  const subscribers = new Set<Effect>();

  return {
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
