import type { StandardSchemaV1 } from "@standard-schema/spec";
import { assert } from "@std/assert/assert";
import { findBaseURL } from "./utils.ts";

export class TypedURLPattern<
  T extends StandardSchemaV1,
  U extends StandardSchemaV1,
> {
  static debug = false;
  static baseURL = "";

  #paramsSchema?: T | undefined;
  #searchParamsSchema?: U | undefined;

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
  }

  match(input: URLPatternInput, baseURL?: string) {
    const match = this.pattern.exec(input, baseURL ?? TypedURLPattern.baseURL);
    if (!match) return null;

    const params = match?.pathname.groups;
    const paramsSchema = this.#paramsSchema;

    let parsedParams;

    if (paramsSchema && params) {
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

    if (searchParamsSchema && search) {
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

    return {
      patternResult: match,
      params: parsedParams as StandardSchemaV1.InferOutput<T>,
      searchParams: parsedSearchParams as StandardSchemaV1.InferOutput<U>,
    };
  }

  href(
    options: {
      params?: StandardSchemaV1.InferInput<T>;
      searchParams?: StandardSchemaV1.InferInput<U>;
      hash?: string | Record<string, string | number | boolean>;
    },
  ): string {
    const pattern = this.pattern;

    let pathname = pattern.pathname;

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        assert(
          typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean",
          "Params must be strings, numbers or booleans",
        );
        pathname = pathname.replace(":" + key, encodeURIComponent(value));
      }
    }

    let search = "";

    if (options.searchParams) {
      const entries: string[] = [];
      for (const [key, value] of Object.entries(options.searchParams)) {
        assert(
          typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean",
          "SearchParams must be strings, numbers or booleans",
        );
        entries.push(`${key}=${encodeURIComponent(value)}`);
      }

      if (entries.length) {
        search = `?${entries.join("&")}`;
      }
    }

    let hash = typeof options.hash === "string" ? "#" + options.hash : "";

    if (typeof options.hash === "object") {
      let patternHash = this.pattern.hash;

      for (const [key, value] of Object.entries(options.hash)) {
        assert(
          typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean",
          "Hash must be strings, numbers or booleans",
        );
        patternHash = patternHash.replace(":" + key, encodeURIComponent(value));
      }

      hash = "#" + patternHash;
    }

    return this.baseURL + pathname + search + hash;
  }
}
