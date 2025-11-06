import { dirname, extname, fromFileUrl, join } from "@std/path";

const moduleDir = dirname(fromFileUrl(import.meta.url));
const rootDir = join(moduleDir, "..", "..", "..");

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
          "@f-stack/functorial": "/packages/functorial/src/reactive.js",
          "@f-stack/reflow": "/packages/reflow/src/html.js"
        }
      }
    </script>
  </head>
  <body>
    <script type="module">
      import test from "${path}/index.js";
      document.body.append(test().fragment);
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
      const templateDir = dirname(path);
      return new Response(template(templateDir), {
        headers: { "content-type": "text/html" },
      });
    }

    if (extension === ".js") {
      const dest = path.startsWith("/packages")
        ? join(rootDir, path)
        : join(moduleDir, path);

      const file = Deno.readTextFileSync(dest);

      return new Response(file, {
        headers: { "content-type": "application/javascript" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies Deno.ServeDefaultExport;
