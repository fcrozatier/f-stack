import { assert, assertEquals, assertExists, assertThrows } from "@std/assert";
import { TypedURLPattern } from "./typedURLPattern.ts";
import * as z from "zod";

const BASE_URL = "https://example.com";

TypedURLPattern.debug = true;
TypedURLPattern.baseURL = BASE_URL;

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
    { params: z.object({ id: z.string() }) },
  );

  const url = route.href({
    params: { id: "55" },
  });

  assertEquals(url, `${BASE_URL}/users/55`);
});

Deno.test("href() type-safe search params", () => {
  const route = new TypedURLPattern({
    pathname: "/search",
    search: "?page=:page&sort=:sort",
  }, {
    searchParams: z.object({ page: z.number(), sort: z.enum(["asc", "desc"]) }),
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

//     Deno.test("URL-encodes parameters", () => {
//       const route = new TypedURLPattern({
//         pathname: "/u/:name",
//       });

//       const url = route.href({
//         pathname: { name: "John Doe" },
//       });

//       assertEquals(url, "/u/John%20Doe");
//     });

//     Deno.test("handles missing optional search/hash sections gracefully", () => {
//       const route = new TypedURLPattern({
//         pathname: "/page/:id",
//         search: "?q=:q",
//         hash: "#x=:x",
//       });

//       const url = route.href({
//         pathname: { id: "12" },
//       });

//       // search/hash omitted entirely
//       assertEquals(url, "/page/12");
//     });
//   });

//   // ───────────────────────────────────────────────
//   // Edge cases and errors
//   // ───────────────────────────────────────────────

//   describe("edge cases", () => {
//     Deno.test("throws if pathname param is missing", () => {
//       const route = new TypedURLPattern({
//         pathname: "/test/:id",
//       });

//       // @ts-expect-error — missing id
//       assertThrows(() => route.href({ pathname: {} as any }));
//     });

//     Deno.test("ignores unused search params", () => {
//       const route = new TypedURLPattern({
//         pathname: "/x/:id",
//         search: "?mode=:mode",
//       });

//       const url = route.href({
//         pathname: { id: "1" },
//         search: { mode: "full", extra: "zzz" } as any,
//       });

//       assertEquals(url, "/x/1?mode=full"); // `extra` ignored
//     });

//     Deno.test("matches full URL objects", () => {
//       const route = new TypedURLPattern({
//         pathname: "/a/:b",
//       });

//       const match = route.exec(new URL("https://site.com/a/xyz"));
//       assertExists(match);
//       assertEquals(match.pathname.b, "xyz");
//     });
//   });
// });

// Deno.test("makes absolute hrefs when no host is provided", () => {
//   const pattern = new TypedURLPattern<{ params: { id: number } }>({
//     pathname: "products/:id",
//   });

//   assertEquals(pattern.href({ params: { id: 1 } }), "/products/1");
// });

// Deno.test("substitutes * for unnamed wildcards in variants", () => {
//   const pattern = createHrefBuilder();
//   assertEquals(
//     href("/files/*.jpg", { "*": "cat/dog" }),
//     "/files/cat/dog.jpg",
//   );
//   assertEquals(
//     href("*/files/*.jpg", { "*": "cat/dog" }),
//     "/cat/dog/files/cat/dog.jpg",
//   );
// });

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
