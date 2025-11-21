import {
  assertEquals,
  assertExists,
  assertInstanceOf,
  unreachable,
} from "@std/assert";
import * as z from "zod";
import { TypedURLPattern } from "@f-stack/typed-url-pattern";

const BASE_URL = "https://example.com";

TypedURLPattern.debug = true;
TypedURLPattern.baseURL = BASE_URL;

Deno.test("matches full URL objects", () => {
  const route = new TypedURLPattern({
    pathname: "/a/:b",
  });

  const match = route.match(new URL(`${BASE_URL}/a/xyz`));
  assertExists(match);
  assertEquals(match.patternResult.pathname.input, "/a/xyz");
});

// Params

Deno.test("type-safe params", () => {
  const pattern = new TypedURLPattern(
    { pathname: "/blog/:year(\\d+)/:title" },
    { params: z.object({ year: z.coerce.number(), title: z.string() }) },
  );

  const match = pattern.match("/blog/2025/my-post");

  assertExists(match);
  assertEquals(match.params, { year: 2025, title: "my-post" });
});

Deno.test("type-safe unnamed params", () => {
  const pattern = new TypedURLPattern(
    { pathname: "/images/*.png" },
    { params: z.object({ "0": z.string() }) },
  );

  const match = pattern.match("/images/cake.png");

  assertExists(match);
  assertEquals(match.params, { 0: "cake" });
});

Deno.test("params validation", () => {
  const pattern = new TypedURLPattern(
    { pathname: "/blog/:year(\\d+)" },
    { params: z.object({ year: z.coerce.number() }) },
  );

  const match = pattern.match("/blog/abc");

  assertEquals(match, null);
});

// Search Params

Deno.test("type-safe search params", () => {
  const pattern = new TypedURLPattern({
    pathname: "/items",
    search: "?view=:mode",
  }, {
    searchParams: z.object({ view: z.enum(["full", "small"]) }),
  });

  const match = pattern.match("/items?view=full");

  assertExists(match);
  assertEquals(match.searchParams.view, "full");
});

Deno.test("search params validation", () => {
  const pattern = new TypedURLPattern({
    pathname: "/items",
    search: "?view=:mode",
  }, {
    searchParams: z.object({ view: z.enum(["full", "small"]) }),
  });

  const match = pattern.match("/items?foo=bar");

  assertEquals(match, null);
});

Deno.test("strict search params validation", () => {
  const pattern = new TypedURLPattern({
    pathname: "/items",
    search: "?view=:mode",
  }, {
    searchParams: z.object({ view: z.enum(["full", "small"]) }),
  });

  const match = pattern.match("/items?view=full&utm=foo");

  assertExists(match);
  assertEquals(match.searchParams, { view: "full" });
});

Deno.test("loose search params validation", () => {
  const pattern = new TypedURLPattern(
    { pathname: "/items", search: "*" },
    {
      searchParams: z.looseObject({ view: z.enum(["full", "small"]) }),
    },
  );

  const match = pattern.match("/items?view=full&utm=foo");

  assertExists(match);
  assertEquals(match.searchParams, { view: "full", utm: "foo" });
});

// hash

Deno.test("type-safe hash", () => {
  const pattern = new TypedURLPattern({
    pathname: "/blog",
    hash: ":section",
  }, {
    hash: z.enum(["intro", "outro"]),
  });

  const match = pattern.match("/blog#intro");

  assertExists(match);
  assertEquals(match.hash, "intro");
});

// href

Deno.test("href() type-safe params", () => {
  const route = new TypedURLPattern(
    { pathname: "/users/:id" },
    { params: z.object({ id: z.coerce.number() }) },
  );

  const url = route.href({
    params: { id: 55 },
  });

  assertEquals(url, `${BASE_URL}/users/55`);
});

Deno.test("href() pathname with unnamed group", () => {
  const route = new TypedURLPattern({ pathname: "/(a.*)" });

  const url = route.href({
    params: { "0": "ab" },
  });

  assertEquals(url, `${BASE_URL}/ab`);
});

Deno.test("href() pathname with lookaround assertions", () => {
  const route = new TypedURLPattern(
    { pathname: "/(a(?=b).*)" },
  );

  const url = route.href({ params: { "0": "ab" } });

  assertEquals(url, `${BASE_URL}/ab`);
});

Deno.test("href() params validation", () => {
  const route = new TypedURLPattern(
    { pathname: "(/a(?=b).*)" },
    { params: z.object({ 0: z.string().startsWith("ab") }) },
  );

  try {
    route.href({ params: { "0": "ax" } });
    unreachable();
  } catch (error) {
    assertInstanceOf(error, TypeError);
    assertEquals(error.message, "[TypedURLPattern]: Invalid href params");
  }
});

Deno.test("href() pathname with optional group", () => {
  const route = new TypedURLPattern(
    { pathname: "/books/:id?" },
    { params: z.object({ id: z.coerce.number().optional() }) },
  );

  const url1 = route.href({
    params: { id: 5 },
  });

  assertEquals(url1, `${BASE_URL}/books/5`);

  // handles the / prefix
  // https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#automatic_group_prefixing_in_pathnames
  const url2 = route.href();

  assertEquals(url2, `${BASE_URL}/books`);
});

Deno.test("href() pathname with optional unmatched group", () => {
  const route = new TypedURLPattern({ pathname: "/book{s}?" });

  const url = route.href();
  assertEquals(url, `${BASE_URL}/books`);
});

Deno.test(
  "href() pathname with a group delimiter containing a capturing group",
  () => {
    const route = new TypedURLPattern(
      { pathname: "/blog/:id(\\d+){-:title}?" },
      {
        params: z.object({
          id: z.coerce.number(),
          title: z.string().optional(),
        }),
      },
    );

    const url1 = route.href({ params: { id: 123, title: "my-recipe" } });
    assertEquals(url1, `${BASE_URL}/blog/123-my-recipe`);

    const url2 = route.href({ params: { id: 123 } });
    assertEquals(url2, `${BASE_URL}/blog/123`);
  },
);

Deno.test("href() pathname with repeated group", () => {
  const route = new TypedURLPattern(
    { pathname: "/books/:id+" },
    { params: z.object({ id: z.string() }) },
  );

  const url1 = route.href({ params: { id: "5" } });
  assertEquals(url1, `${BASE_URL}/books/5`);

  const url2 = route.href({ params: { id: "123/456" } });
  assertEquals(url2, `${BASE_URL}/books/123/456`);
});

Deno.test("href() pathname with wildcard", () => {
  const route = new TypedURLPattern(
    { pathname: "/users/:id(\\d+)" },
    { params: z.object({ id: z.coerce.number() }) },
  );

  const url = route.href({
    params: { id: 55 },
  });

  assertEquals(url, `${BASE_URL}/users/55`);
});

Deno.test("href() type-safe search params", () => {
  const route = new TypedURLPattern({
    pathname: "/search",
    search: "?page=:page&sort=:sort",
  }, {
    searchParams: z.object({
      page: z.coerce.number(),
      sort: z.enum(["asc", "desc"]),
    }),
  });

  const url = route.href({
    searchParams: { page: 2, sort: "asc" },
  });

  assertEquals(url, `${BASE_URL}/search?page=2&sort=asc`);
});

Deno.test("href() with hash", () => {
  const route = new TypedURLPattern({
    pathname: "/blog",
    hash: ":section",
  }, {
    hash: z.enum(["intro", "outro"]),
  });

  const url = route.href({ hash: "intro" });

  assertEquals(url, `${BASE_URL}/blog#intro`);
});

Deno.test("href() URL-encodes parameters", () => {
  const route = new TypedURLPattern({
    pathname: "/u/:name",
  });

  const url1 = route.href({
    params: { name: "John Doe" },
    encodeURI: true,
  });

  assertEquals(url1, `${BASE_URL}/u/John%20Doe`);

  const url2 = route.href({
    params: { name: "Hélène" },
    encodeURI: false,
  });

  assertEquals(url2, `${BASE_URL}/u/Hélène`);
});

Deno.test("href() type-safe inputs", () => {
  const route1 = new TypedURLPattern({
    pathname: "/test/*/:id",
  }, { params: z.object({ id: z.coerce.number(), "0": z.string() }) });

  // Complains if the options object is missing
  // @ts-expect-error
  route1.href();

  // Complains if the params key is missing
  // @ts-expect-error
  route1.href({});
});

Deno.test("href() handles wildcards params", () => {
  const route = new TypedURLPattern({ pathname: "*/images/*.jpg" });
  const url = route.href({ params: { "0": "user/recipes", "1": "cake" } });

  assertEquals(url, `${BASE_URL}/user/recipes/images/cake.jpg`);
});

// Deno.test("fills in params", () => {
//   const pattern = createHrefBuilder();

//   assertEquals(href("products/:id", { id: "1" }), "/products/1");
//   // Number is coerced to string
//   assertEquals(href("products/:id", { id: 1 }), "/products/1");

//   assertEquals(
//     href("images/*path.png", { path: "images/hero" }),
//     "/images/images/hero.png",
//   );
//   assertEquals(
//     href("images/*.png", { "*": "images/hero" }),
//     "/images/images/hero.png",
//   );

//   // Include optionals by default
//   assertEquals(href("products(.md)"), "/products.md");

//   // Omit optionals with undefined/missing params
//   assertEquals(href("products/:id(.:ext)", { id: "1" }), "/products/1");
//   assertEquals(href("products(/:id)", {}), "/products");
//   assertEquals(href("products(/:id)", null), "/products");
// });

// Deno.test("requires a valid pattern", () => {
//   const pattern = createHrefBuilder<"products(/:id)">();
//   // @ts-expect-error invalid pattern
//   assertEquals(href("does-not-exist"), "/does-not-exist");
// });

// Deno.test("throws when required params are missing", () => {
//   const pattern = createHrefBuilder();
//   // @ts-expect-error missing required "id" param
//   assert.throws(() => href("products/:id", {}), new MissingParamError("id"));
//   // @ts-expect-error missing required "category" param
//   assert.throws(
//     () => href("*category/products", {}),
//     new MissingParamError("category"),
//   );
// });

// Deno.test("fills in search params", () => {
//   const pattern = createHrefBuilder();

//   assertEquals(
//     href("products/:id", { id: "1" }, { sort: "asc" }),
//     "/products/1?sort=asc",
//   );

//   assertEquals(
//     href("products/:id", { id: "1" }, { sort: "asc", limit: "10" }),
//     "/products/1?sort=asc&limit=10",
//   );

//   assertEquals(
//     href("products/:id", { id: "1" }, "sort=asc&limit=10"),
//     "/products/1?sort=asc&limit=10",
//   );

//   assertEquals(
//     href(
//       "products/:id",
//       { id: "1" },
//       new URLSearchParams("sort=asc&limit=10"),
//     ),
//     "/products/1?sort=asc&limit=10",
//   );

//   assertEquals(
//     href("products/:id", { id: "1" }, [
//       ["sort", "asc"],
//       ["limit", "10"],
//     ]),
//     "/products/1?sort=asc&limit=10",
//   );

//   // Preserves existing search params exactly as provided
//   assertEquals(
//     href("products/:id?sort=asc&limit=", { id: "1" }),
//     "/products/1?sort=asc&limit=",
//   );

//   // Swaps out a new value for an existing param
//   assertEquals(
//     href("https://remix.run/search?q=remix", null, { q: "angular" }),
//     "https://remix.run/search?q=angular",
//   );

//   // Completely replaces existing search params
//   assertEquals(
//     href("https://remix.run/search?q=remix", null, { some: "thing" }),
//     "https://remix.run/search?some=thing",
//   );
// });
