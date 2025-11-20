import type { StandardSchemaV1 } from "@standard-schema/spec";
import { assert } from "@std/assert/assert";
import { findBaseURL } from "./utils.ts";

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
    ...args:
      (unknown extends StandardSchemaV1.InferInput<T>
        ? unknown extends StandardSchemaV1.InferInput<U>
          ? unknown extends StandardSchemaV1.InferInput<V> ? true : false
        : false
        : false) extends true ? [
          options?: Pretty<
            & ConditionalOptional<
              "params",
              StandardSchemaV1.InferInput<T>,
              unknown extends StandardSchemaV1.InferInput<T> ? true : false
            >
            & ConditionalOptional<
              "searchParams",
              StandardSchemaV1.InferInput<U>,
              unknown extends StandardSchemaV1.InferInput<U> ? true : false
            >
            & ConditionalOptional<
              "hash",
              StandardSchemaV1.InferInput<V> & string,
              unknown extends StandardSchemaV1.InferInput<V> ? true : false
            >
          >,
        ]
        : [
          options: Pretty<
            & ConditionalOptional<
              "params",
              StandardSchemaV1.InferInput<T>,
              unknown extends StandardSchemaV1.InferInput<T> ? true : false
            >
            & ConditionalOptional<
              "searchParams",
              StandardSchemaV1.InferInput<U>,
              unknown extends StandardSchemaV1.InferInput<U> ? true : false
            >
            & ConditionalOptional<
              "hash",
              StandardSchemaV1.InferInput<V> & string,
              unknown extends StandardSchemaV1.InferInput<V> ? true : false
            >
          >,
        ]
  ): string {
    const { params, searchParams, hash } = (args[0] ?? {}) as {
      params?: StandardSchemaV1.InferInput<T>;
      searchParams?: StandardSchemaV1.InferInput<U>;
      hash?: StandardSchemaV1.InferInput<V> & string;
    };
    const pattern = this.pattern;

    let baseURL = this.baseURL;

    // `baseURL` can be an empty string here
    if (!baseURL) {
      const protocol = this.pattern.protocol;
      const hostname = this.pattern.hostname;
      const port = this.pattern.port ? ":" + this.pattern.port : "";

      baseURL = protocol + "://" + hostname + port;
      this.baseURL = baseURL;
    }

    let pathname = pattern.pathname;

    if (params) {
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
            new RegExp(":" + key + "([(][^\)]+[\)])?"),
            encodeURIComponent(value),
          );
        } else {
          // unnamed groups
          pathname = pathname.replace("*", String(value));
        }
      }
    }

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
        entries.push(`${key}=${encodeURIComponent(value)}`);
      }

      if (entries.length) {
        search = `?${entries.join("&")}`;
      }
    }

    const _hash = typeof hash === "string" ? "#" + hash : "";

    return baseURL + pathname + search + _hash;
  }
}

type Pretty<T> = { [K in keyof T]: T[K] } & {};

type ConditionalOptional<T extends PropertyKey, U, Condition extends boolean> =
  & { [K in T as Condition extends true ? K : never]?: U }
  & { [K in T as Condition extends true ? never : K]: U };
