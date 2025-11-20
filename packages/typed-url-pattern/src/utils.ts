/**
 * Extracts the BaseURL from the input URL
 */
export function findBaseURL(input: string) {
  const index = input.indexOf("/", 8); // look for the first / after https?://
  return index === -1 ? input : input.slice(0, index);
}
