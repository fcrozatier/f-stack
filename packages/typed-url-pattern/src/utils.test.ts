import { assertEquals } from "@std/assert/equals";
import { findBaseURL } from "./utils.ts";

Deno.test("findBaseURL", () => {
  assertEquals(findBaseURL("http://a.b/c"), "http://a.b");
  assertEquals(findBaseURL("http://a.b/"), "http://a.b");
  assertEquals(findBaseURL("http://a.b"), "http://a.b");

  assertEquals(findBaseURL("https://a.b/c"), "https://a.b");
  assertEquals(findBaseURL("https://a.b/"), "https://a.b");
  assertEquals(findBaseURL("https://a.b"), "https://a.b");
});
