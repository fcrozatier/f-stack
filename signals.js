

let runningEffect;

export const createSignal = (initialValue) => {
  let value = initialValue;
  const subscribers = new Set();

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

export const createEffect = (fn) => {
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
