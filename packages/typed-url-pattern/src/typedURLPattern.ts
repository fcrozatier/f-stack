export class TypedURLPattern<
  T extends {
    params?: Record<string, string | number | boolean>;
    searchParams?: Record<string, string | number | boolean>;
    hash?: string;
  },
> {
  #pattern: URLPattern;
  #baseURL: string | undefined;

  // Provide a default baseURL
  constructor(input: URLPatternInput, baseURL?: string) {
    this.#pattern = new URLPattern(input, baseURL);
    this.#baseURL = baseURL;
  }

  match(input: URLPatternInput) {
    const match = this.#pattern.exec(input, this.#baseURL);
    if (!match) return null;

    return {
      protocol: match.protocol.input,
      username: match.username.input,
      password: match.password.input,
      hostname: match.hostname.input,
      port: match.port.input,
      pathname: match.pathname.input,
      params: match?.pathname.groups as T["params"],
      search: match?.search.input,
      searchGroups: match?.search.groups,
      searchParams: new URLSearchParams(match?.search.input),
      hash: match?.search.input,
    };
  }

  href(options: T): string {
    const pattern = this.#pattern;

    const protocol = pattern.protocol ? pattern.protocol + "://" : "";
    const username = pattern.username ? pattern.username + "@" : "";
    const port = pattern.port ? ":" + pattern.port : "";

    let pathname = pattern.pathname;

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        pathname = pathname.replace(key, encodeURIComponent(value));
      }
    }

    let search = "";

    if (options.searchParams) {
      const entries: string[] = [];
      for (const [key, value] of Object.entries(options.searchParams)) {
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
