

```ts
import { TypedURLPattern } from '@f-stack/typed-url-pattern';
import * as z from "zod";

const userRoute = new TypedURLPattern(
    { pathname: "/users/:id" },
    { params: z.object({ id: z.number() }) }
);

userRoute.href({ params: { id: 123 } });
```

# TypedURLPattern

A tiny TypeScript wrapper around the Web's native [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) API providing:

- Type-safe params for your routes and API endpoints
- [Standard Schema](https://standardschema.dev/) validation
- Standard `URLPattern` syntax that's here to stay (just use the Platform)
- A typed `href()` inverse (build URLs with type-safe params)
- Zero dependencies and framework-agnostic
- Works in Deno, Bun, Node, and Cloudflare Workers

## Install

## Example patterns

- **Typed parameter extraction**

```ts
const match = route.exec("/users/42?tab=info#section=photos");

match.pathname.id;        // string
match.search.tab;         // string
match.hash.section;       // string
```

- **Typed inverse: build URLs from params**

```ts
route.href({
  pathname: { id: "42" },
  search:   { tab: "info" },
  hash:     { section: "photos" },
});
// "/users/42?tab=info#section=photos"
```

- **Zero overhead** — only a thin and fully typed layer over URLPattern.
- **Full pattern support** for pathname, search, and hash segments.
- **Great for routers**, service workers, runtime routing, API request matching, etc.

## Quick Start

1. Create a typed pattern
```ts
const route = new TypedURLPattern({
  pathname: "/users/:id",
  search: "?tab=:tab",
  hash: "#section=:section",
});
```

2. Extract typed params
```ts
const match = route.exec("https://example.com/users/123?tab=info#section=photos");

if (match) {
  match.pathname.id;        // "123"
  match.search.tab;         // "info"
  match.hash.section;       // "photos"
}
```

3. Generate URLs (inverse of exec())
```ts
const url = route.href({
  pathname: { id: "123" },
  search:   { tab: "info" },
  hash:     { section: "photos" },
});

console.log(url);
// "/users/123?tab=info&section=photos"
```

## API
