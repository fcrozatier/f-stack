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
