export type Primitive = string | number | boolean | null | undefined;

export function isPrimitive(data: unknown): data is Primitive {
  return data === null ||
    ["string", "number", "boolean", "undefined"].includes(typeof data);
}
