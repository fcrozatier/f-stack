/** @internal */
export type Pretty<T> = { [K in keyof T]: T[K] } & {};

// deno-fmt-ignore
/** @internal */
export type ConditionalOptional<T extends PropertyKey, U, Condition extends boolean> =
& { [K in T as Condition extends true ? K : never]?: U }
& { [K in T as Condition extends true ? never : K]: U };

type FilterRequiredKeys<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

/** @internal */
export type AreAllKeysOptional<T> = {} extends FilterRequiredKeys<T> ? true
  : false;

// deno-fmt-ignore
/** @internal */
export type And<T extends boolean, U extends boolean> =
T extends true
  ? U extends true
    ? true
    : false
  : false;

// deno-fmt-ignore
/** @internal */
export type Or<T extends boolean, U extends boolean> =
T extends true
  ? true
    : U extends true
    ? true
  : false;

/**
 * Extracts the BaseURL from the input URL
 *
 * @internal
 */
export function findBaseURL(input: string) {
  const index = input.indexOf("/", 8); // look for the first / after https?://
  return index === -1 ? input : input.slice(0, index);
}

/** @internal */
export const POSITIVE_LOOKAHEAD = /\(\?=[^\)]+\)/g;

/** @internal */
export const NEGATIVE_LOOKAHEAD = /\(\?![^\)]+\)/g;

/** @internal */
export const POSITIVE_LOOKBEHIND = /\(\?<=[^\)]+\)/g;

/** @internal */
export const NEGATIVE_LOOKBEHIND = /\(\?<![^\)]+\)/g;

// wildcard or regex group
/** @internal */
export const UNNAMED_GROUP = /\*[?+*]?|\([^\)]+\)[?+*]?/g;

/** @internal */
export const OPTIONAL_NAMED_GROUP = /\/?:[^(}]+([(][^)}]+[)])?[?]/g;

// lookahead ensuring the group has no missing captured groups named, wildcards or unnamed
/** @internal */
export const UNMATCHED_GROUP_DELIMITER = /\{(?<content>[^}]+)\}[?+*]?/g;

/** @internal */
export const HAS_NO_MISSING_CAPTURED_GROUPS = /[^:*(]*(?!:[^}]+)(?!\*)(?!\()/;
