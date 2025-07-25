const alphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz0123456789-";

/**
 * Creates a nanoid of a given length in the URL-safe alphabet [a-zA-Z0-9_-] (64 characters)
 *
 * Implementation Note: this implementation is much faster than Uint8Arrays
 *
 * @param {number} length The length of the nanoid
 * @default 8
 */
export const nanoId = (length: number = 8) => {
  let str = "";

  while (str.length < length) {
    str += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return str;
};
