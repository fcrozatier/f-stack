import { assert, assertEquals, assertExists, assertThrows } from "@std/assert";
import { TypedURLPattern } from "./typedURLPattern.ts";
import * as z from "zod";

TypedURLPattern.debug = true;
TypedURLPattern.baseURL = "https://example.com";

// Pathname

Deno.test("matches a simple pathname", () => {
  const pattern = new TypedURLPattern({ pathname: "/users" });
  const match = pattern.match("/users");

  assertExists(match);
  assertEquals(match.pathname, "/users");
});

Deno.test("returns null for non-matching paths", () => {
  const pattern = new TypedURLPattern({ pathname: "/users" });
  const match = pattern.match("/posts");

  assertEquals(match, null);
});

// Params

Deno.test("extracts params", () => {
  const pattern = new TypedURLPattern(
    { pathname: "/blog/:year(\\d+)/:title" },
    { params: z.object({ year: z.coerce.number(), title: z.string() }) },
  );

  const match = pattern.match("/blog/2025/my-post");

  assertExists(match);
  assertEquals(match.params, { year: 2025, title: "my-post" });
});

Deno.test("returns null if params don't match", () => {
  const pattern = new TypedURLPattern(
    { pathname: "/blog/:year(\\d+)" },
    { params: z.object({ year: z.coerce.number() }) },
  );

  const match = pattern.match("/blog/first");

  assertEquals(match, null);
});

Deno.test("extracts unnamed params", () => {
  const pattern = new TypedURLPattern(
    { pathname: "/images/*.png" },
    { params: z.object({ "0": z.string() }) },
  );

  const match = pattern.match("/images/cake.png");

  assertExists(match);
  assertEquals(match.params, { 0: "cake" });
});

// Search Params

Deno.test("extracts search params", () => {
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

Deno.test("fails if search params don't match", () => {
  const pattern = new TypedURLPattern({
    pathname: "/items",
    search: "?view=:mode",
  }, {
    searchParams: z.object({ view: z.enum(["full", "small"]) }),
  });

  const match = pattern.match("/items?foo=bar");

  assertEquals(match, null);
});

Deno.test("strips unspecified search params", () => {
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

Deno.test("allows optional search params", () => {
  const pattern = new TypedURLPattern(
    { pathname: "/items", search: "*" },
    {
      searchParams: z.looseObject({ view: z.enum(["full", "small"]) }),
    },
  );

  const match = pattern.match("/items?view=full&utm=foo");

  assertExists(match);

  // utm passes through, we could use `z.object` or `z.strictObject` to prevent that
  assertEquals(match.searchParams, { view: "full", utm: "foo" });
});

// Hash

// Deno.test("extracts hash params", () => {
//   const pattern = new TypedURLPattern({
//     pathname: "/docs",
//     hash: ":section",
//   });

//   const match = pattern.match("/docs#section=intro", baseURL);

//   assertExists(match);
//   assertEquals(match.hash.id, "intro");
// });

//   // ───────────────────────────────────────────────
//   // hash parameters
//   // ───────────────────────────────────────────────

//   describe("hash parameter matching", () => {
//
//   });

//   // ───────────────────────────────────────────────
//   // href() inverse URL construction
//   // ───────────────────────────────────────────────

//   describe("href() URL generation", () => {
//     Deno.test("generates basic URLs", () => {
//       const route = new TypedURLPattern({
//         pathname: "/users/:id",
//       });

//       const url = route.href({
//         pathname: { id: "55" },
//       });

//       assertEquals(url, "/users/55");
//     });

//     Deno.test("generates URLs with search params", () => {
//       const route = new TypedURLPattern({
//         pathname: "/users/:id",
//         search: "?tab=:tab&sort=:sort",
//       });

//       const url = route.href({
//         pathname: { id: "8" },
//         search: { tab: "info", sort: "asc" },
//       });

//       assertEquals(url, "/users/8?tab=info&sort=asc");
//     });

//     Deno.test("generates URLs with hash params", () => {
//       const route = new TypedURLPattern({
//         pathname: "/docs/:page",
//         hash: "#section=:section",
//       });

//       const url = route.href({
//         pathname: { page: "intro" },
//         hash: { section: "install" },
//       });

//       assertEquals(url, "/docs/intro#section=install");
//     });

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
