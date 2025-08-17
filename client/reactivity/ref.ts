// implemented by https://github.com/mizulu

export function createSafeRef<T extends HTMLElement>() {
  let el: T | null = null;
  const actionQueue: Array<(el: T) => void> = [];
  const readPromises: Map<keyof T, Array<(value: any) => void>> = new Map();
  const pendingValues: Map<keyof T, any> = new Map();

  const proxyTarget = function setElement(element: T) {
    el = element;

    for (const action of actionQueue) {
      try {
        action(el);
      } catch (err) {
        console.error("Failed to apply queued action:", err);
      }
    }
    actionQueue.length = 0;

    for (const [prop, resolvers] of readPromises.entries()) {
      const value = el[prop];
      resolvers.forEach(resolve => resolve(value));
    }
    readPromises.clear();

    pendingValues.clear();
  };

  const proxy = new Proxy(proxyTarget as unknown as T, {
    apply(target, thisArg, args: [T]) {
      return proxyTarget.apply(thisArg, args);
    },
    get(target, prop: keyof T) {
      if (el) {
        return el[prop];
      }

      const proto = HTMLElement.prototype;
      const isMethod = typeof (proto[prop as keyof HTMLElement] || EventTarget.prototype[prop as keyof EventTarget]) === 'function';

      if (isMethod) {
        return new Proxy(() => {}, {
          apply(_target, _thisArg, args) {
            actionQueue.push((element: T) => {
              const fn = element[prop];
              if (typeof fn === 'function') {
                fn.apply(element, args);
              }
            });
          }
        });
      }

      if (pendingValues.has(prop)) {
        return pendingValues.get(prop);
      }

      return new Promise<any>(resolve => {
        const resolvers = readPromises.get(prop) || [];
        resolvers.push(resolve);
        readPromises.set(prop, resolvers);
      });
    },
    set(target, prop: keyof T, value: any) {
      if (el) {
        el[prop] = value;
        return true;
      }

      actionQueue.push((element: T) => {
        element[prop] = value;
      });
      pendingValues.set(prop, value);
      return true;
    }
  });

  return proxy as T & { (el: T): void };
}

// Demo

import { render } from "solid-js/web";
import { createSignal, Show } from "solid-js";

import { createSafeRef as createSafeRef } from "./createSafeRef";

// zulu

function Counter() {
  const [showButton, setShowButton] = createSignal(false);

  let r = createSafeRef<HTMLButtonElement>();

  const onClk = () => {
    console.log("Clicked");
  };

  r.addEventListener("click", onClk);

  // set a property on an unresolved ref element
  console.log("setting r.value to Hello");
  r.value = "Hello";

  // read a property that was set on an unresolved ref element
  // user needs to be careful with readonly  properties, which will change after the ref resolve
  console.log(
    "if a property is set directly we can read it right away [r.value]: ",
    r.value,
  );

  // reading properties on an unresolved ref, that were not set yet.
  // return a promise
  console.log(
    "if a property is read before it was resolved it will be a promise [r.type]",
    r.type,
  );

  // run async function
  (async () => {
    console.log("(Async function) Value (awaited): ", await r.value);
    console.log(
      "(Async function) after the ref is set, we can read the value directly:",
      r.value,
    );
  })();

  // we can also remove the listener,before  the ref is resolve.  it will be queued.
  // r.removeEventListener("click",onClk)

  // show button in the future
  setTimeout(() => {
    setShowButton(true);
  }, 2000);

  return (
    <Show when={showButton()} fallback={<b>Loading button</b>}>
      <input type="button" ref={r}>
        {showButton()}
      </input>
    </Show>
  );
}

render(() => <Counter />, document.getElementById("app")!);
