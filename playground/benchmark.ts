import { html } from "../packages/reflow/src/html.js";

function median(arr: number[]) {
  const length = arr.length;

  if (length === 0) throw new Error("Empty array");

  const lowerMiddleIndex = Math.floor((length - 1) / 2);
  const upperMiddleIndex = Math.ceil((length - 1) / 2);

  return (arr[lowerMiddleIndex]! + arr[upperMiddleIndex]!) / 2;
}

export const Benchmark = (count: number, fn: (...args: any[]) => any) => {
  const durations: number[] = [];
  const start = performance.now();

  for (let i = 0; i < count; i++) {
    const before = performance.now();
    fn();
    const after = performance.now();
    durations.push(+(after - before).toFixed(2));
  }

  const end = performance.now();

  const duration = (end - start).toFixed(2);
  const avg = (+duration / count).toFixed(2);
  const med = median(durations.toSorted());

  return html`
    <p>
      Benchmark done in ${duration}ms
    </p>
    <p>
      Average render time ${avg}ms
    </p>
    <p>
      Median render time ${med.toFixed(2)}ms
    </p>
  `;
};
