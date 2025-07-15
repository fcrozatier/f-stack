export class AssertionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AssertionError";
  }
}

export function assert(expr: unknown, msg: string): asserts expr {
  if (!expr) {
    throw new AssertionError(msg);
  }
}

export function assertExists<T>(
  actual: T,
  msg?: string,
): asserts actual is NonNullable<T> {
  if (actual === undefined || actual === null) {
    msg ??= `Expected ${actual} to not be null or undefined.`;
    throw new AssertionError(msg);
  }
}
