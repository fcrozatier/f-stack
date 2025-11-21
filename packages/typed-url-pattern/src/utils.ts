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
