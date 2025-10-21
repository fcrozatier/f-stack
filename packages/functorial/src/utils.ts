/**
 * Describes primitives
 */
export type Primitive = string | number | boolean | null | undefined;

/**
 * Checks whether a value is a primitive
 */
export function isPrimitive(value: unknown): value is Primitive {
  return value === null ||
    ["string", "number", "boolean", "undefined"].includes(typeof value);
}
