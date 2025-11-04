import { basename, dirname, extname, fromFileUrl, join } from "@std/path";

const moduleDir = dirname(fromFileUrl(import.meta.url));

const template = (path: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playground</title>
    <script type="importmap">
      {
        "imports": {
          "@std/assert/": "https://esm.sh/jsr/@std/assert/",
          "@f-stack/reflow/reactivity": "/build/packages/functorial/src/reactive.js",
          "@f-stack/reflow": "/build/packages/reflow/src/mod.js"
        }
      }
    </script>
  </head>
  <body>
    <script type="module">
      import test from "./${path}/index.js";
      document.body.append(test());
    </script>
  </body>
</html>
`;

/**
 * Test server
 */
export default {
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const extension = extname(path);

    if (extension === ".html") {
      const filename = basename(path, extension);
      return new Response(template(filename), {
        headers: { "content-type": "text/html" },
      });
    }

    if (extension === ".js") {
      const dest = path.startsWith("/build")
        ? join(moduleDir, "..", "..", "..", path)
        : !path.startsWith("/functorial")
        ? join(moduleDir, path)
        : "";

      const file = Deno.readTextFileSync(dest);

      return new Response(file, {
        headers: { "content-type": "application/javascript" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies Deno.ServeDefaultExport;
