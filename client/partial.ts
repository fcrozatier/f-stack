import type { PartiallyApplicableFunction } from "./definitions.d.ts";

export function withPartial<
  Props extends Record<string, unknown>,
  R,
>(
  fn: (props: Props) => R,
): PartiallyApplicableFunction<Props, R> {
  return Object.assign(fn, {
    partial<P extends Partial<Props>>(partialProps: P) {
      const partiallyApplicable = withPartial((
        rest: P & Omit<Props, keyof P>,
        // @ts-ignore trust me
      ) => fn({ ...partialProps, ...rest }));

      Object.assign(partiallyApplicable, fn);

      return partiallyApplicable;
    },
  });
}
