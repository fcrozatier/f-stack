import type { StandardSchemaV1 } from "@standard-schema/spec";
import { assert } from "@std/assert/assert";

export class TypedURLPattern<
  T extends StandardSchemaV1,
  U extends StandardSchemaV1,
> {
  static debug = false;
  static baseURL = "";

  #paramsSchema: T | undefined;
  #searchParamsSchema: U | undefined;

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
    const init: URLPatternInit = typeof input === "string"
      ? { pathname: input, baseURL: TypedURLPattern.baseURL }
      : { ...input, baseURL: input.baseURL ?? TypedURLPattern.baseURL };

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
      protocol: match.protocol.input,
      username: match.username.input,
      password: match.password.input,
      hostname: match.hostname.input,
      port: match.port.input,
      pathname: match.pathname.input,
      params: parsedParams as StandardSchemaV1.InferOutput<T>,
      search: match?.search.input,
      searchGroups: match?.search.groups,
      searchParams: parsedSearchParams as StandardSchemaV1.InferOutput<U>,
      hash: match?.search.input,
    };
  }

  href(
    options: {
      params?: StandardSchemaV1.InferInput<T>;
      searchParams?: StandardSchemaV1.InferInput<U>;
      hash?: string;
    },
  ): string {
    const pattern = this.pattern;

    const protocol = pattern.protocol ? pattern.protocol + "://" : "";
    const username = pattern.username ? pattern.username + "@" : "";
    const port = pattern.port ? ":" + pattern.port : "";

    let pathname = pattern.pathname;

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        assert(
          typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean",
          "Params must be strings, numbers or booleans",
        );
        pathname = pathname.replace(key, encodeURIComponent(value));
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

    const hash = options.hash ? "#" + options.hash : "";

    return protocol + username + pattern.hostname + port + pathname + search +
      hash;
  }
}
