import type { FullyBindableFunction } from "../definitions.d.ts";

export function withBindFully<
  Props extends Record<string, unknown>,
  R,
>(
  fn: (props: Props) => R,
): FullyBindableFunction<Props, R> {
  return Object.assign(fn, {
    bindFully(props: Props) {
      const fullyBound = fn.bind(null, props);
      Object.assign(fullyBound, fn);

      return fullyBound;
    },
  });
}
