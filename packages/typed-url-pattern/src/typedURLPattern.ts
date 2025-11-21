import type { StandardSchemaV1 } from "@standard-schema/spec";
import { assert } from "@std/assert/assert";
import {
  type And,
  type AreAllKeysOptional,
  type ConditionalOptional,
  findBaseURL,
  HAS_NO_MISSING_CAPTURED_GROUPS,
  NEGATIVE_LOOKAHEAD,
  NEGATIVE_LOOKBEHIND,
  OPTIONAL_NAMED_GROUP,
  POSITIVE_LOOKAHEAD,
  POSITIVE_LOOKBEHIND,
  type Pretty,
  UNMATCHED_GROUP_DELIMITER,
  UNNAMED_GROUP,
} from "./utils.ts";
import { assertExists } from "@std/assert/exists";
import { assertEquals } from "@std/assert/equals";

export class TypedURLPattern<
  T extends StandardSchemaV1,
  U extends StandardSchemaV1,
  V extends StandardSchemaV1,
> {
  static debug = false;
  static baseURL = "";

  #paramsSchema?: T | undefined;
  #searchParamsSchema?: U | undefined;
  #hashSchema?: V | undefined;

  baseURL = "";

  /**
   * Pattern syntax
   * https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#pattern_syntax
   */
  pattern: URLPattern;

  // Provide a default baseURL
  constructor(
    input: URLPatternInput,
    schema?: {
      params?: T;
      searchParams?: U;
      hash?: V;
    },
  ) {
    let baseURL = "";

    if (typeof input === "string") {
      // We need to figure out the baseURL from the input string
      baseURL = findBaseURL(input);
    } else {
      baseURL = input.baseURL ?? TypedURLPattern.baseURL;
    }

    this.baseURL = baseURL;

    const init: URLPatternInput = typeof input === "string"
      ? input
      : { ...input, baseURL };

    this.pattern = new URLPattern(init);
    this.#paramsSchema = schema?.params;
    this.#searchParamsSchema = schema?.searchParams;
    this.#hashSchema = schema?.hash;
  }

  match(input: URLPatternInput, baseURL?: string) {
    const url = typeof input === "string"
      ? new URL(input, baseURL ?? TypedURLPattern.baseURL)
      : input;
    const match = this.pattern.exec(url);
    if (!match) return null;

    const params = match?.pathname.groups;
    const paramsSchema = this.#paramsSchema;

    let parsedParams;

    if (paramsSchema) {
      const result = paramsSchema["~standard"].validate(params);

      if (result instanceof Promise) {
        throw new TypeError(
          "[TypedURLPattern]: URL Pattern validation must be synchronous",
        );
      }

      if (result.issues) {
        if (TypedURLPattern.debug) {
          console.log("[TypedURLPattern]:", result.issues);
        }
        return null;
      }
      parsedParams = result.value;
    }

    const search = match?.search.input;
    const searchParamsSchema = this.#searchParamsSchema;

    let parsedSearchParams;

    if (searchParamsSchema) {
      const searchParams = Object.fromEntries(new URLSearchParams(search));
      const result = searchParamsSchema["~standard"].validate(searchParams);

      if (result instanceof Promise) {
        throw new TypeError(
          "[TypedURLPattern]: URL Pattern validation must be synchronous",
        );
      }

      if (result.issues) {
        if (TypedURLPattern.debug) {
          console.log("[TypedURLPattern]", result.issues);
        }
        return null;
      }
      parsedSearchParams = result.value;
    }

    const hashSchema = this.#hashSchema;
    let parsedHash;

    if (hashSchema) {
      const result = hashSchema["~standard"].validate(match?.hash.input);

      if (result instanceof Promise) {
        throw new TypeError(
          "[TypedURLPattern]: URL Pattern validation must be synchronous",
        );
      }

      if (result.issues) {
        if (TypedURLPattern.debug) {
          console.log("[TypedURLPattern]:", result.issues);
        }
        return null;
      }
      parsedHash = result.value;
    }

    return {
      patternResult: match,
      params: parsedParams as StandardSchemaV1.InferOutput<T>,
      searchParams: parsedSearchParams as StandardSchemaV1.InferOutput<U>,
      hash: parsedHash as StandardSchemaV1.InferOutput<V>,
    };
  }

  href(
    // The options object itself is optional if no schema is defined or all their keys are optional
    ...args: (
      // No schema is defined
      // deno-fmt-ignore
      And<
        unknown extends StandardSchemaV1.InferInput<T> ? true : AreAllKeysOptional<StandardSchemaV1.InferInput<T>>,
        And<
          unknown extends StandardSchemaV1.InferInput<U> ? true : AreAllKeysOptional<StandardSchemaV1.InferInput<U>>,
          unknown extends StandardSchemaV1.InferInput<V> ? true : AreAllKeysOptional<StandardSchemaV1.InferInput<V>>
        >
      >
    ) extends true ? [
        options?: Pretty<
          & ConditionalOptional<
            "params",
            StandardSchemaV1.InferInput<T>,
            unknown extends StandardSchemaV1.InferInput<T> ? true
              : AreAllKeysOptional<StandardSchemaV1.InferInput<T>>
          >
          & ConditionalOptional<
            "searchParams",
            StandardSchemaV1.InferInput<U>,
            unknown extends StandardSchemaV1.InferInput<U> ? true
              : AreAllKeysOptional<StandardSchemaV1.InferInput<U>>
          >
          & ConditionalOptional<
            "hash",
            StandardSchemaV1.InferInput<V> & string,
            unknown extends StandardSchemaV1.InferInput<V> ? true : false
          >
          & { encodeURI?: boolean }
        >,
      ]
      : [
        options: Pretty<
          & ConditionalOptional<
            "params",
            StandardSchemaV1.InferInput<T>,
            unknown extends StandardSchemaV1.InferInput<T> ? true
              : AreAllKeysOptional<StandardSchemaV1.InferInput<T>>
          >
          & ConditionalOptional<
            "searchParams",
            StandardSchemaV1.InferInput<U>,
            unknown extends StandardSchemaV1.InferInput<U> ? true
              : AreAllKeysOptional<StandardSchemaV1.InferInput<U>>
          >
          & ConditionalOptional<
            "hash",
            StandardSchemaV1.InferInput<V> & string,
            unknown extends StandardSchemaV1.InferInput<V> ? true
              : AreAllKeysOptional<StandardSchemaV1.InferInput<V>>
          >
          & { encodeURI?: boolean }
        >,
      ]
  ): string {
    const { params, searchParams, hash } = (args[0] ?? {}) as {
      params?: StandardSchemaV1.InferInput<T>;
      searchParams?: StandardSchemaV1.InferInput<U>;
      hash?: StandardSchemaV1.InferInput<V> & string;
      encodeURI?: boolean;
    };
    const pattern = this.pattern;

    let baseURL = this.baseURL;

    // `baseURL` can be an empty string here
    if (!baseURL) {
      const protocol = pattern.protocol;
      const hostname = pattern.hostname;
      const port = pattern.port ? ":" + pattern.port : "";

      baseURL = protocol + "://" + hostname + port;
      this.baseURL = baseURL;
    }

    let pathname = pattern.pathname;

    // Remove lookaround assertions
    pathname = pathname
      .replaceAll(POSITIVE_LOOKAHEAD, "")
      .replaceAll(NEGATIVE_LOOKAHEAD, "")
      .replaceAll(POSITIVE_LOOKBEHIND, "")
      .replaceAll(NEGATIVE_LOOKBEHIND, "");

    if (params) {
      if (this.#paramsSchema) {
        const result = this.#paramsSchema["~standard"].validate(params);

        if (result instanceof Promise) {
          throw new TypeError(
            "[TypedURLPattern]: URL Pattern validation must be synchronous",
          );
        }

        if (result.issues) {
          throw new TypeError(
            "[TypedURLPattern]: Invalid href params",
          );
        }
      }

      // handle unnamed groups after named groups have been normalized
      const unnamedGroups: [number, string][] = [];

      for (const [key, value] of Object.entries(params)) {
        assert(
          typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean",
          "Params must be strings, numbers or booleans",
        );

        if (Number.isNaN(Number(key))) {
          // named groups: the key is not a number
          // also remove optional regex as in :id(\\d+)
          pathname = pathname.replace(
            new RegExp(":" + key + "([(][^\)]+[\)])?[?+*]?"),
            String(value),
          );
        } else {
          // unnamed groups
          unnamedGroups.push([Number(key), String(value)]);
        }
      }

      // 1/2 Remove unspecified optional named groups
      pathname = pathname.replaceAll(OPTIONAL_NAMED_GROUP, "");

      // 2/2 All remaining groups are unnamed and can be replaced in order
      unnamedGroups.sort((a, b) => a[0] - b[0]);

      for (let i = 0; i < unnamedGroups.length; i++) {
        const group = unnamedGroups[i];
        assertExists(group, `[TypedURLPattern]: Missing unnamed param ${i}`);

        const [index, value] = group;
        assertEquals(index, i, `[TypedURLPattern]: Missing unnamed param ${i}`);

        pathname = pathname.replace(UNNAMED_GROUP, String(value));
      }
    } else {
      // Remove unspecified optional named groups
      pathname = pathname.replaceAll(OPTIONAL_NAMED_GROUP, "");
    }

    // Edge case: collapse double slashes
    // A pathname like (/a.*) when retrieved from the pattern with a base URL is /(/a.*) and, if substituted by /ab yields an unexpected double
    // Example: new URLPattern({ pathname: "(/a.*)", baseURL: "https://example.com" })
    pathname = pathname.replace("//", "/");

    // group delimiters
    pathname = pathname.replaceAll(UNMATCHED_GROUP_DELIMITER, (_match, $1) => {
      if (HAS_NO_MISSING_CAPTURED_GROUPS.exec($1)?.[0]) {
        // Replace unmatched groups by their content if they have no missing capture group
        return $1;
      }
      // otherwise remove the group, has it's either fine if the group is optional or will error during later validation if the group is required
      return "";
    });

    let search = "";

    if (searchParams) {
      const entries: string[] = [];
      for (const [key, value] of Object.entries(searchParams)) {
        assert(
          typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean",
          "SearchParams must be strings, numbers or booleans",
        );
        entries.push(`${key}=${value}`);
      }

      if (entries.length) {
        search = `?${entries.join("&")}`;
      }
    }

    const _hash = typeof hash === "string" ? "#" + hash : "";
    const href = baseURL + pathname + search + _hash;
    const uri = args[0]?.encodeURI ? encodeURI(href) : href;

    if (!pattern.exec(uri)) {
      throw new TypeError("[TypedURLPattern]: href doesn't match the pattern");
    }

    return uri;
  }
}
