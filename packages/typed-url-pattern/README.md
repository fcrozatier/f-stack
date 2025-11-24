# TypedURLPattern

A tiny TypeScript wrapper around the native
[URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) API
providing:

- **Type-safety** for your routes, endpoints and links
- **Parsing and validation** with [Standard Schema](https://standardschema.dev/)
- **Standard syntax**: it's just `URLPattern` under the hood (use the Platform)
- A typed `href()` inverse (create type-safe links)

## Install

## Common patterns

- **Typed named parameters**

```ts
import { TypedURLPattern } from "@f-stack/typed-url-pattern";
import * as z from "zod";

const route = new TypedURLPattern(
  { pathname: "/user/:name", baseURL: "https://example.com" },
  { params: z.object({ name: z.string() }) },
);

const match = route.match("/user/bob");

match?.params.name === "bob";
```

- **Typed wildcards**

Unnamed groups can be typed, parsed and validated in the order they appear

```ts
import { TypedURLPattern } from "@f-stack/typed-url-pattern";
import * as z from "zod";

const route = new TypedURLPattern(
  { pathname: "/assets/*/*.png", baseURL: "https://example.com" },
  { params: z.object({ 0: z.string(), 1: z.enum(["cake", "banana"]) }) },
);

const match = route.match("/assets/path/to/cake.png");

match?.params[0] === "path/to";
match?.params[1] === "cake";
```

- **Typed optional searchParams**

Use a `looseObject` to allow optional searchParams that are not specified in the
schema. This is useful when you don't control links to your page _eg_ search
engines adding `utm` searchParams etc.

```ts
import { TypedURLPattern } from "@f-stack/typed-url-pattern";
import * as z from "zod";

const route = new TypedURLPattern(
  { pathname: "/watch", baseURL: "https://example.com" },
  { searchParams: z.looseObject({ id: z.string() }) },
);

const match = route.match("/watch?id=abc&utm=utm_source");

match?.searchParams.id === "abc";

// utm has not been stripped since we use a looseObject
match?.searchParams.utm === "utm_source";
```

- **Parsing and validation**

Coerce strings extracted by `URLPattern` to numbers, booleans etc

```ts
import { TypedURLPattern } from "@f-stack/typed-url-pattern";
import * as z from "zod";

const route = new TypedURLPattern(
  { pathname: "/user/:id", baseURL: "https://example.com" },
  { params: z.object({ id: z.coerce.number() }) },
);

const match = route.match("/user/12");

match?.params.id === 12;
```

- **Default baseURL**

Use the static `baseURL` property to provide a sensible default to all your
patterns.

This allows to avoid the "relative URL without a base" `TypeError` common with
`URLPattern`

```ts
import { TypedURLPattern } from "@f-stack/typed-url-pattern";

// once
TypedURLPattern.baseURL = "https://example.com";

const route = new TypedURLPattern({ pathname: "/blog" });

route.test("https://example.com/blog") === true;
```

- **Typed href() inverse**

Build type safe links from your patterns and provided params.

The following demo showcases:

- typed params and searchParams substitution
- typed optional wildcards
- typed optional group delimiters
- typed optional searchParams

```ts
import { TypedURLPattern } from "@f-stack/typed-url-pattern";
import * as z from "zod";

const route = new TypedURLPattern(
  { pathname: "/blog{/*}?/:id{-:title}?", baseURL: "https://example.com" },
  {
    params: z.object({
      id: z.coerce.number(),
      title: z.string().optional(),
      0: z.enum(["recipes", "trips"]).optional(),
    }),
    searchParams: z.looseObject({ page: z.coerce.number() }),
  },
);

// without title but with wildcard
const href1 = route.href({
  params: { id: 42, 0: "recipes" },
  hash: "intro",
});

href1 === "https://example.com/recipes/42#intro";

// with title but without wildcard
const href2 = route.href({
  params: { id: 42, title: "my-cake" },
  searchParams: { page: 2 },
});

href2 === "https://example.com/42-mycake?page=2";
```

## API
