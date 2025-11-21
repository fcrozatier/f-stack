export type Pretty<T> = { [K in keyof T]: T[K] } & {};

// deno-fmt-ignore
export type ConditionalOptional<T extends PropertyKey, U, Condition extends boolean> =
  & { [K in T as Condition extends true ? K : never]?: U }
  & { [K in T as Condition extends true ? never : K]: U };

type FilterRequiredKeys<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

export type AreAllKeysOptional<T> = {} extends FilterRequiredKeys<T> ? true
  : false;

// deno-fmt-ignore
export type And<T extends boolean, U extends boolean> =
  T extends true
  ? U extends true
    ? true
    : false
  : false;

// deno-fmt-ignore
export type Or<T extends boolean, U extends boolean> =
  T extends true
  ? true
  : U extends true
    ? true
    : false;

/**
 * Extracts the BaseURL from the input URL
 */
export function findBaseURL(input: string) {
  const index = input.indexOf("/", 8); // look for the first / after https?://
  return index === -1 ? input : input.slice(0, index);
}

export const POSITIVE_LOOKAHEAD = /\(\?=[^\)]+\)/g;
export const NEGATIVE_LOOKAHEAD = /\(\?![^\)]+\)/g;
export const POSITIVE_LOOKBEHIND = /\(\?<=[^\)]+\)/g;
export const NEGATIVE_LOOKBEHIND = /\(\?<![^\)]+\)/g;

// wildcard or regex group
export const UNNAMED_GROUP = /\*|\([^\)]+\)/;
export const OPTIONAL_NAMED_GROUP = /\/?:[^(}]+([(][^)}]+[)])?[?]/g;

// lookahead ensuring the group has no missing captured groups named, wildcards or unnamed
export const UNMATCHED_GROUP_DELIMITER = /\{(?<content>[^}]+)\}[?+*]?/g;
export const HAS_NO_MISSING_CAPTURED_GROUPS = /[^:*(]*(?!:[^}]+)(?!\*)(?!\()/;
